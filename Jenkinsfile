pipeline {
    agent any
    tools {
        nodejs 'NodeJS'
    }

    environment {
        AWS_REGION = 'us-east-1'
        S3_BUCKET = 'prog8860-lab2-artifacts'
        LAMBDA_FUNCTION_NAME = 'prog8860-lab2-lambda'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build') {
            steps {
                sh 'npm install'
                sh 'npm run build'
                sh 'zip -r deployment.zip dist/'
            }
        }

        stage('Test') {
            steps {
                sh 'npm test'
            }
        }

        stage('Push to S3') {
            steps {
                withAWS(credentials: 'aws-credentials') {
                    sh 'aws s3 cp deployment.zip s3://$S3_BUCKET/'
                }
            }
        }

        stage('Deploy to Lambda') {
            steps {
                withAWS(credentials: 'aws-credentials') {
                    sh 'aws lambda update-function-code --function-name $LAMBDA_FUNCTION_NAME --s3-bucket $S3_BUCKET --s3-key deployment.zip'
                }
            }
        }
    }

    post {
        success {
            echo 'Deployment successful'
        }
        failure {
            echo 'Deployment failed'
        }
    }
}

