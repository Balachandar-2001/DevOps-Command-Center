import "./App.css";

const technologies = [
  "React",
  "Docker",
  "Jenkins",
  "SonarQube",
  "Trivy",
  "AWS",
  "Kubernetes",
  "Prometheus",
  "Grafana",
];

function App() {
  return (
    <div className="container">
      <header>
        <h1>🚀 DevOps Command Centerrr</h1>
        <p>Production CI/CD Demo Project</p>
      </header>

      <section className="card">
        <h2>Application Details</h2>

        <div className="info">
          <p>
            <strong>Application:</strong> React DevOps Demo
          </p>

          <p>
            <strong>Version:</strong> v1.0.0
          </p>

          <p>
            <strong>Environment:</strong> Development
          </p>

          <p>
            <strong>Status:</strong>
            <span className="status"> 🟢 Healthy</span>
          </p>
        </div>
      </section>

      <section className="card">
        <h2>Technology Stack</h2>

        <div className="tech-grid">
          {technologies.map((tech) => (
            <div key={tech} className="tech-card">
              {tech}
            </div>
          ))}
        </div>
      </section>

      <footer>
        <p>© 2026 DevOps Command Center</p>
      </footer>
    </div>
  );
}

export default App;