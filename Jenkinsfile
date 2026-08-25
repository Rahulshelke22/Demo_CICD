pipeline {
    agent any

    // Requires "NodeJS" plugin configured in:
    // Manage Jenkins > Tools > NodeJS installations (name it "node20" or update below)
    tools {
        nodejs 'node20'
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

        stage('Clean previous Allure results') {
            steps {
                // Prevents old runs' pass/fail data from bleeding into this
                // build's report. Ignores the error if the folder doesn't
                // exist yet (first run).
                bat 'if exist allure-results rmdir /s /q allure-results'
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
            // Publish the Playwright HTML report (requires the "HTML Publisher" plugin)
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

            // Generate the static Allure report from allure-results/ (written by the
            // allure-playwright reporter configured in playwright.config.ts), then
            // publish it the same way as the Playwright report above. This runs
            // whether tests passed or failed, and even if allure-results is empty
            // (allowMissing: true), so the pipeline never breaks because of it.
            bat script: 'npx allure generate allure-results --clean -o allure-report', returnStatus: true
            publishHTML(target: [
                allowMissing: true,
                alwaysLinkToLastBuild: true,
                keepAll: true,
                reportDir: 'allure-report',
                reportFiles: 'index.html',
                reportName: 'Allure Report'
            ])

            archiveArtifacts artifacts: 'playwright-report/**, allure-report/**, test-results/**', allowEmptyArchive: true, fingerprint: true
        }
        failure {
            echo 'Build failed — check the Playwright HTML report, Allure Report, and JUnit results above for details.'
        }
    }
}
