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
                    // Skip creating config files and use environment variables directly
                    powershell '''
                        # Set AWS CLI command directly with credentials
                        aws lambda update-function-code `
                            --function-name $env:LAMBDA_FUNCTION_NAME `
                            --zip-file fileb://deployment.zip `
                            --no-verify-ssl
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