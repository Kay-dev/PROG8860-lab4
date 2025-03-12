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

        stage('Deploy to Lambda') {
            steps {
                withEnv([
                    "AWS_ACCESS_KEY_ID=${env.AWS_ACCESS_KEY_ID}",
                    "AWS_SECRET_ACCESS_KEY=${env.AWS_SECRET_ACCESS_KEY}",
                    "AWS_SESSION_TOKEN=${env.AWS_SESSION_TOKEN}",
                    "AWS_DEFAULT_REGION=${env.AWS_REGION}"
                ]) {
                    powershell '''
                        # Create AWS config files
                        $awsFolder = "$env:USERPROFILE\\.aws"
                        New-Item -Path $awsFolder -ItemType Directory -Force | Out-Null
                        
                        # Create credentials file
                        @"
[default]
aws_access_key_id = $env:AWS_ACCESS_KEY_ID
aws_secret_access_key = $env:AWS_SECRET_ACCESS_KEY
aws_session_token = $env:AWS_SESSION_TOKEN
region = $env:AWS_DEFAULT_REGION
"@ | Out-File -FilePath "$awsFolder\\credentials" -Encoding utf8 -Force
                        
                        # Create config file to disable SSL verification
                        @"
[default]
region = $env:AWS_DEFAULT_REGION
output = json
ssl_verify = false
"@ | Out-File -FilePath "$awsFolder\\config" -Encoding utf8 -Force
                        
                        # Update Lambda function directly with the ZIP file
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