pipeline {
    agent any
    tools {
        nodejs 'NodeJS'
    }

    environment {
        AWS_REGION = 'us-east-1'
        S3_BUCKET = 'prog8860-artifacts'
        LAMBDA_FUNCTION_NAME = 'prog8860-lab2-lambda'
        PATH = "${env.PATH};C:\\Program Files\\Amazon\\AWSCLIV2"
    }

    stages {
        stage('Debug PATH') {
            steps {
                powershell 'echo $env:PATH'
            }
        }
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install Dependencies') {
            steps {
                powershell 'npm install'
                powershell 'Compress-Archive -Path ./index.js, ./node_modules/* -DestinationPath deployment.zip -Force'
            }
        }

        stage('Test') {
            steps {
                powershell 'npm test'
            }
        }

        stage('Check AWS Credentials') {
            steps {
                withAWS(credentials: 'aws-credentials', region: 'us-east-1') {
                    powershell "aws sts get-caller-identity"
                }
            }
        }

        stage('Push to S3') {
            steps {
                withAWS(credentials: 'aws-credentials', region: 'us-east-1') {
                    powershell 'aws s3 cp deployment.zip s3://$env:S3_BUCKET/ --no-verify-ssl'
                }
            }
        }

        stage('Deploy to Lambda') {
            steps {
                withAWS(credentials: 'aws-credentials', region: 'us-east-1') {
                    powershell 'aws lambda update-function-code --function-name $env:LAMBDA_FUNCTION_NAME --s3-bucket $env:S3_BUCKET --s3-key deployment.zip'
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

