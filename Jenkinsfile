pipeline {
    agent any

    // Requires "NodeJS" plugin configured in:
    // Manage Jenkins > Tools > NodeJS installations (name it "Node20" or update below)
    tools {
        nodejs 'Node20'
    }

    options {
        timestamps()
        timeout(time: 60, unit: 'MINUTES')
        buildDiscarder(logRotator(numToKeepStr: '20'))
    }

    parameters {
        choice(
            name: 'PROJECT',
            choices: ['all', 'chromium', 'firefox', 'webkit', 'api'],
            description: 'Which Playwright project to run'
        )
    }

    environment {
        CI = 'true'
        // These are plain config values (not secrets), so they're just env vars here.
        // Override per-build via "Build with Parameters" or by editing the defaults below.
        // If you DO want them managed as Jenkins credentials instead, replace with:
        //   BASE_URL = credentials('DEMOWEBSHOP_BASE_URL')
        BASE_URL     = 'https://demowebshop.tricentis.com'
        API_BASE_URL = 'https://fakestoreapi.com'
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install dependencies') {
            steps {
                bat 'npm ci'
            }
        }

        stage('Install Playwright browsers') {
            steps {
                bat 'npx playwright install --with-deps'
            }
        }

        stage('Run UI tests') {
            when {
                expression { params.PROJECT == 'all' || params.PROJECT in ['chromium', 'firefox', 'webkit'] }
            }
            steps {
                script {
                    if (params.PROJECT == 'all') {
                        bat 'npx playwright test --project=chromium --project=firefox --project=webkit'
                    } else {
                        bat "npx playwright test --project=${params.PROJECT}"
                    }
                }
            }
        }

        stage('Run API tests') {
            when {
                expression { params.PROJECT == 'all' || params.PROJECT == 'api' }
            }
            steps {
                bat 'npx playwright test --project=api'
            }
        }
    }

    post {
        always {
            // Publish the HTML report (requires the "HTML Publisher" plugin)
            publishHTML(target: [
                allowMissing: true,
                alwaysLinkToLastBuild: true,
                keepAll: true,
                reportDir: 'playwright-report',
                reportFiles: 'index.html',
                reportName: 'Playwright HTML Report'
            ])

            // Publish JUnit results (requires the "JUnit" plugin — built in to most Jenkins setups)
            junit allowEmptyResults: true, testResults: 'test-results/junit.xml'

            archiveArtifacts artifacts: 'playwright-report/**, test-results/**', allowEmptyArchive: true, fingerprint: true
        }
        failure {
            echo 'Build failed — check the Playwright HTML report and JUnit results above for details.'
        }
    }
}
