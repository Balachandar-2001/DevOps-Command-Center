# DevOps Command Center

A complete, reproducible operational setup for a self-hosted CI/CD platform — covering infrastructure provisioning, a DevSecOps pipeline, cluster monitoring, and disaster recovery runbooks. The React app in this repo is a deliberately minimal demo application whose purpose is to exercise the full pipeline end to end, not a product in itself.

## Why this exists

Most CI/CD demo projects stop at "build → deploy." This one goes further: it treats the DevOps platform itself as something that needs to be provisioned, monitored, secured, and — critically — recovered when it breaks. The repo doubles as an operational runbook, not just a pipeline definition.

## Architecture

```
GitHub (push/webhook)
   │
   ▼
Jenkins  ──▶  npm install & build
   │
   ▼
SonarQube (static analysis + quality gate)
   │
   ▼
OWASP Dependency Check (dependency vulnerability scan)
   │
   ▼
Docker build
   │
   ▼
Trivy (container image scan)
   │
   ▼
Docker push → Docker Hub
   │
   ▼
Ansible deploy (deploy.yml) ──▶ Kubernetes (deployment.yaml / service.yaml)
   │
   ▼
Prometheus + Grafana (kube-prometheus-stack via Helm)
```

## Repo structure

| Path | Purpose |
|---|---|
| `Jenkinsfile` | CI/CD pipeline definition (build → scan → deploy stages above) |
| `Dockerfile` | Container build for the demo React app |
| `ansible/site.yml` | Provisions Jenkins EC2 host and Kubernetes nodes; installs required tooling |
| `ansible/install-tools.yml` | Installs Java, Git, Docker, Jenkins, kubectl, Helm, AWS CLI, Trivy, Sonar Scanner, OWASP Dependency Check |
| `ansible/docker.yml` | Docker installation/configuration role |
| `ansible/kubernetes.yml` | Cluster init, worker join, kubectl configuration |
| `ansible/monitoring.yml` | Installs kube-prometheus-stack via Helm, exposes Grafana via LoadBalancer |
| `ansible/inventory.ini` | Target host inventory for all playbooks |
| `k8s/deployment.yaml`, `k8s/service.yaml` | Kubernetes manifests for the demo app |
| `src/` | Demo React application (Create React App) — deployment target for the pipeline, not the point of the project |

## Pipeline stages, in detail

1. **Checkout** — Jenkins pulls from GitHub via webhook trigger.
2. **Build** — `npm install` and production build of the React app.
3. **Static analysis** — SonarQube scan with a configured quality gate; the build fails if the gate isn't met.
4. **Dependency scan** — OWASP Dependency Check flags known-vulnerable dependencies.
5. **Containerize** — Docker image build.
6. **Image scan** — Trivy scans the built image for OS and library vulnerabilities before it's allowed to ship.
7. **Publish** — Image pushed to Docker Hub.
8. **Deploy** — Ansible's `deploy.yml` applies the Kubernetes deployment using `image_name`/`image_tag` variables, so any built image can be rolled out without editing manifests by hand.

## Monitoring

`kube-prometheus-stack` is installed via Helm across the cluster. Grafana is exposed through a LoadBalancer service for real-time visibility into cluster and application health — no manual dashboard wiring required.

## Disaster recovery runbooks

This project treats "the platform itself can fail" as a first-class scenario, not an afterthought:

| Scenario | Recovery steps |
|---|---|
| Jenkins host lost | Launch new EC2 instance → clone repo → install Ansible → run `site.yml` → restore Jenkins configuration → redeploy app |
| Kubernetes pods lost | Run `ansible-playbook deploy.yml` or re-trigger the Jenkins pipeline |
| Kubernetes cluster lost | Recreate cluster → reconfigure `kubectl` → run `site.yml` → redeploy app |
| Entire infrastructure lost | Recreate servers → reconfigure cluster → run `site.yml` → restore Jenkins → redeploy app |

## Useful commands

```bash
kubectl get nodes
kubectl get pods -A
kubectl get svc
kubectl rollout status deployment/react-app

docker images
trivy image <image>

ansible-playbook -i inventory.ini site.yml
ansible-playbook -i inventory.ini deploy.yml --extra-vars "image_name=<image> image_tag=<tag>"
```

## Roadmap

- Jenkins Configuration as Code
- ArgoCD for GitOps-based delivery
- Terraform for infrastructure provisioning (replacing manual EC2/cluster setup)
- Vault for secrets management
- Loki + Promtail + Tempo for log and trace aggregation alongside existing metrics
- HPA / Cluster Autoscaler / KEDA for autoscaling
- Istio service mesh

## Notes

- The demo application under `src/` is unmodified Create React App scaffolding, used only as a build/deploy target for the pipeline.
- Built and documented by [Balachandar R](https://linkedin.com/in/balachandarr).
