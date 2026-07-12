pipeline {
    agent any
    
    environment {
        IMAGE_NAME = "30balachandar333/react-devops-demo"
        SCANNER_HOME = tool 'SonarScanner'
        DEPENDENCY_CHECK_HOME = tool 'DependencyCheck'
    }

    stages {

        stage('Checkout Source') {
            steps {
                git branch: 'main',
                url: 'https://github.com/Balachandar-2001/DevOps-Command-Center.git'
            }
        }

        stage('Install Dependencies') {
            steps {
                sh 'npm ci'
            }
        }

        stage('Build React App') {
            steps {
                sh 'npm run build'
            }
        }

        stage('SonarQube Analysis') {
            steps {
                 withSonarQubeEnv('SonarQube') {
                    sh """
                          ${SCANNER_HOME}/bin/sonar-scanner \
                            -Dsonar.projectKey=react-app \
                            -Dsonar.projectName=react-app \
                            -Dsonar.sources=. \
                            -Dsonar.javascript.lcov.reportPaths=coverage/lcov.info
                        """
                 }
            }
        }

        stage('Quality Gate') {
            steps {
                    timeout(time: 5, unit: 'MINUTES') {
                    waitForQualityGate abortPipeline: true
                }
            }
        }

        stage('OWASP Dependency Check') {
            steps {
                sh """
                    mkdir -p dependency-check-report

                    ${DEPENDENCY_CHECK_HOME}/bin/dependency-check.sh \
                    --project React-App \
                    --scan . \
                    --format XML \
                    --format HTML \
                    --out dependency-check-report
                    --disableYarnAudit
                """
            }
        }

        stage('Publish OWASP Report') {
            steps {
                dependencyCheckPublisher pattern: 'dependency-check-report/dependency-check-report.xml'
            }
        }
        
        stage('Build Docker Image') {
            steps {
                sh """
                docker build \
                -t ${IMAGE_NAME}:${BUILD_NUMBER} \
                -t ${IMAGE_NAME}:latest .
                """
            }
        }

        stage('Trivy Filesystem Scan') {
            steps {
                sh '''
                  trivy fs . \
                 --format table \
                 --severity HIGH,CRITICAL
                '''
            }
        }

        stage('Trivy Image Scan') {
            steps {
                    sh """
                    trivy image ${IMAGE_NAME}:${BUILD_NUMBER} \
                    --format table \
                    --severity HIGH,CRITICAL
                    """
                }
        }
        
        stage('Docker Login') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'dockerhub-creds',
                    usernameVariable: 'DOCKER_USER',
                    passwordVariable: 'DOCKER_PASS'
                    )]){
                    sh '''
                      echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin
                    '''
                }
            }
        }
        
        stage('Push to dockerhub') {
            steps {
                sh """
                docker push ${IMAGE_NAME}:${BUILD_NUMBER}
                docker push ${IMAGE_NAME}:latest
                """
            }
        }

        stage('Deploy to Kubernetes') {
            steps {
                sh """
                    kubectl set image deployment/react-app \
                    react-app=${IMAGE_NAME}:${BUILD_NUMBER}

                    kubectl rollout status deployment/react-app
                """
            }
        }

    }
    post {
        always {
            archiveArtifacts artifacts: 'dependency-check-report/*'
            cleanWs()
        }

        success {
            echo "Pipeline completed successfully!"
        }

        failure {
            echo "Pipeline failed."
        }
    }
}
