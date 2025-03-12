import groovy.json.JsonSlurper

pipeline {
    agent any
    tools {
        nodejs 'NodeJS'
    }

    environment {
        AWS_REGION = 'us-east-1'
        LAMBDA_FUNCTION_NAME = 'prog8860-lab2-lambda'
        PATH = "${env.PATH};C:\\Program Files\\Amazon\\AWSCLIV2"
        // Explicitly set AWS config file paths with proper Windows backslashes
        AWS_CONFIG_FILE = 'C:\\Windows\\Temp\\empty-aws-config'
        AWS_SHARED_CREDENTIALS_FILE = 'C:\\Windows\\Temp\\empty-aws-credentials'
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
                powershell '''
                    if (-Not (Test-Path -Path "deployment.zip")) {
                        Write-Host "Creating deployment.zip file..."
                        Compress-Archive -Path ./index.js, ./node_modules/* -DestinationPath deployment.zip -Force
                    } else {
                        Write-Host "deployment.zip already exists, skipping archive creation."
                    }
                '''
            }
        }

        stage('Test') {
            steps {
                powershell 'npm test'
            }
        }

        stage('Deploy to Lambda') {
            steps {
                withEnv([
                    "AWS_ACCESS_KEY_ID=${env.AWS_ACCESS_KEY_ID}",
                    "AWS_SECRET_ACCESS_KEY=${env.AWS_SECRET_ACCESS_KEY}",
                    "AWS_SESSION_TOKEN=${env.AWS_SESSION_TOKEN}",
                    "AWS_DEFAULT_REGION=${env.AWS_REGION}",
                    "AWS_CONFIG_FILE=${env.AWS_CONFIG_FILE}",
                    "AWS_SHARED_CREDENTIALS_FILE=${env.AWS_SHARED_CREDENTIALS_FILE}"
                ]) {
                    powershell '''
                        # Create empty config files if they don't exist
                        if (-Not (Test-Path -Path $env:AWS_CONFIG_FILE)) {
                            New-Item -Path $env:AWS_CONFIG_FILE -ItemType File -Force | Out-Null
                        }
                        if (-Not (Test-Path -Path $env:AWS_SHARED_CREDENTIALS_FILE)) {
                            New-Item -Path $env:AWS_SHARED_CREDENTIALS_FILE -ItemType File -Force | Out-Null
                        }
                        
                        # Deploy directly to Lambda
                        aws lambda update-function-code --function-name $env:LAMBDA_FUNCTION_NAME --zip-file fileb://deployment.zip
                    '''
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