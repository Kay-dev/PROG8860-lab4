pipeline {
    agent any
    tools {
        nodejs 'NodeJS'
    }

    environment {
        AWS_REGION = 'us-east-1'
        S3_BUCKET = 'prog8860-artifacts'
        LAMBDA_FUNCTION_NAME = 'prog8860-lab2-lambda'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install Dependencies') {
            steps {
                powershell 'npm install'
                powershell 'Compress-Archive -Path ./server.js, ./node_modules/* -DestinationPath deployment.zip'
            }
        }

        stage('Test') {
            steps {
                powershell 'npm test'
            }
        }

        stage('Push to S3') {
            steps {
                withAWS(credentials: 'aws-credentials') {
                    powershell "aws s3 cp deployment.zip s3://$env:S3_BUCKET/"
                }
            }
        }

        stage('Deploy to Lambda') {
            steps {
                withAWS(credentials: 'aws-credentials') {
                    powershell "aws lambda update-function-code --function-name $env:LAMBDA_FUNCTION_NAME --s3-bucket $env:S3_BUCKET --s3-key deployment.zip"
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

