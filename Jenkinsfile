import groovy.json.JsonSlurper
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
        // Add these environment variables to disable SSL verification
        AWS_CA_BUNDLE = ''
        PYTHONWARNINGS = 'ignore:Unverified HTTPS request'
    }

    stages {
        stage('Setup AWS Credentials') {
            steps {
                script {
                    def awsCredsJson
                    withCredentials([string(credentialsId: 'aws-json', variable: 'AWS_CREDS_JSON')]) {
                        awsCredsJson = env.AWS_CREDS_JSON
                        // Parse credentials and set environment variables
                        def awsCreds = new JsonSlurper().parseText(awsCredsJson)
                        env.AWS_ACCESS_KEY_ID = awsCreds.aws_access_key_id
                        env.AWS_SECRET_ACCESS_KEY = awsCreds.aws_secret_access_key
                        env.AWS_SESSION_TOKEN = awsCreds.aws_session_token
                    }
                }
            }
        }
        
        
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

        stage('Push to S3') {
            steps {
                withEnv(["AWS_ACCESS_KEY_ID=${env.AWS_ACCESS_KEY_ID}", 
                         "AWS_SECRET_ACCESS_KEY=${env.AWS_SECRET_ACCESS_KEY}", 
                         "AWS_SESSION_TOKEN=${env.AWS_SESSION_TOKEN}",
                         "AWS_CA_BUNDLE=",
                         "PYTHONWARNINGS=ignore:Unverified HTTPS request"]) {
                    // Create AWS CLI config file to disable SSL verification
                    powershell '''
                        $configContent = @"
[default]
region = $env:AWS_REGION
s3 =
    signature_version = s3v4
    max_concurrent_requests = 5
    addressing_style = path
    no_verify_ssl = true
"@
                        New-Item -Path $env:USERPROFILE\\.aws -ItemType Directory -Force
                        Set-Content -Path $env:USERPROFILE\\.aws\\config -Value $configContent
                        
                        # Attempt S3 upload with additional flags
                        aws s3 cp deployment.zip s3://$env:S3_BUCKET/ --no-verify-ssl --cli-connect-timeout 30
                    '''
                }
            }
        }

        stage('Deploy to Lambda') {
            steps {
                withEnv(["AWS_ACCESS_KEY_ID=${env.AWS_ACCESS_KEY_ID}", 
                         "AWS_SECRET_ACCESS_KEY=${env.AWS_SECRET_ACCESS_KEY}", 
                         "AWS_SESSION_TOKEN=${env.AWS_SESSION_TOKEN}",
                         "AWS_CA_BUNDLE=",
                         "PYTHONWARNINGS=ignore:Unverified HTTPS request"]) {
                    powershell 'aws lambda update-function-code --function-name $env:LAMBDA_FUNCTION_NAME --s3-bucket $env:S3_BUCKET --s3-key deployment.zip --no-verify-ssl'
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
