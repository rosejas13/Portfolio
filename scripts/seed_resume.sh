#!/bin/bash
# Populate portfolio with dummy data for local development.
# Run after: docker compose up -d
# All data is fictional — safe to commit and share.

API="http://localhost:3001"
TOKEN=$(curl -s "$API/rpc/login_dev" | tr -d '"')
AUTH="Authorization: Bearer $TOKEN"

echo "=== Skills ==="
for skill in \
  "TypeScript,Language" \
  "Python,Language" \
  "Rust,Language" \
  "React,Frontend" \
  "Next.js,Frontend" \
  "Node.js,Backend" \
  "GraphQL,Backend" \
  "REST APIs,Backend" \
  "PostgreSQL,Backend" \
  "AWS Lambda,Cloud" \
  "S3,Cloud" \
  "DynamoDB,Cloud" \
  "Docker,DevOps" \
  "Terraform,DevOps" \
  "CI/CD,DevOps" \
  "Git,Tools" \
  "Figma,Design" \
  "Storybook,Design"
do
  IFS=',' read -r name cat <<< "$skill"
  curl -s -X POST "$API/skills" -H "$AUTH" -H "Content-Type: application/json" \
    -d "{\"name\":\"$name\",\"category\":\"$cat\"}" > /dev/null
  echo "  + $name ($cat)"
done

echo ""
echo "=== Experiences ==="

add_exp() {
  local company="$1" role="$2" location="$3" start="$4" end="$5" current="$6" desc="$7"
  shift 7
  local highlights=()
  while [ $# -gt 0 ]; do
    highlights+=("$1")
    shift
  done

  local json
  json=$(jq -n \
    --arg company "$company" \
    --arg role "$role" \
    --arg location "$location" \
    --arg start "$start" \
    --argjson end "$([ "$end" = "null" ] && echo null || echo "\"$end\"")" \
    --argjson current "$current" \
    --argjson highlights "$(printf '%s\n' "${highlights[@]}" | jq -R . | jq -s .)" \
    '{company: $company, role: $role, location: $location, start_date: $start, end_date: $end, current: $current, highlights: $highlights}')
  curl -s -X POST "$API/experiences" -H "$AUTH" -H "Content-Type: application/json" -H "Prefer: return=representation" \
    -d "$json" > /dev/null
  echo "  + $role @ $company"
}

add_exp "Acme Corp" "Senior Software Engineer" "San Francisco, CA (Remote)" \
  "2023-01-01" "2025-06-01" false \
  "Led full-stack development of customer-facing dashboard used by 10k+ daily active users" \
  "Migrated legacy REST APIs to GraphQL, reducing payload sizes by 60%" \
  "Built real-time notification system using WebSockets and Redis pub/sub" \
  "Mentored 4 junior engineers through onboarding and code review" \
  "Introduced Playwright E2E tests, cutting regression bugs by 40%"

add_exp "Globex Inc" "Software Engineer" "New York, NY" \
  "2020-06-01" "2023-01-01" false \
  "Developed microservices architecture handling 1M+ requests/day" \
  "Implemented CI/CD pipelines reducing deploy time from 2 hours to 15 minutes" \
  "Built internal admin tools used across 5 product teams" \
  "Contributed to open-source component library maintained by the company"

add_exp "Initech" "Junior Developer" "Austin, TX" \
  "2018-09-01" "2020-06-01" false \
  "Built and maintained REST APIs for e-commerce platform" \
  "Wrote unit and integration tests achieving 85% code coverage" \
  "Participated in agile ceremonies and bi-weekly sprint planning" \
  "Developed internal CLI tool adopted by the entire engineering org"

add_exp "Cyberdyne Systems" "Software Engineering Intern" "Los Angeles, CA" \
  "2017-06-01" "2018-08-01" false \
  "Built internal dashboard for monitoring server health and alerting" \
  "Automated data pipeline processing with Python and Apache Airflow" \
  "Presented internship project to engineering leadership and CTO"

echo ""
echo "=== Education ==="
for edu in \
  "State University,Bachelor of Science,Computer Science,2013-09-01,2017-06-01" \
  "Community College,null,General Studies,2011-09-01,2013-06-01"
do
  IFS=',' read -r school degree field start end <<< "$edu"
  curl -s -X POST "$API/education" -H "$AUTH" -H "Content-Type: application/json" \
    -d "{\"school\":\"$school\",\"degree\":\"$degree\",\"field\":\"$field\",\"start_date\":\"$start\",\"end_date\":$([ "$end" = "null" ] && echo null || echo "\"$end\"")}" > /dev/null
  echo "  + $school"
done

echo ""
echo "=== Site Config: Update hero ==="
curl -s -X PATCH "$API/site_config?key=eq.hero_tagline" -H "$AUTH" -H "Content-Type: application/json" \
  -d '{"value": "Full-Stack Developer | React · Node.js · AWS"}' > /dev/null
curl -s -X PATCH "$API/site_config?key=eq.hero_bio" -H "$AUTH" -H "Content-Type: application/json" \
  -d '{"value": "Full-stack developer with a passion for building performant, accessible web applications. Experienced across the entire stack from React frontends to serverless backends on AWS."}' > /dev/null
curl -s -X PATCH "$API/site_config?key=eq.social_github" -H "$AUTH" -H "Content-Type: application/json" \
  -d '{"value": "https://github.com/username"}' > /dev/null
curl -s -X PATCH "$API/site_config?key=eq.social_linkedin" -H "$AUTH" -H "Content-Type: application/json" \
  -d '{"value": "https://linkedin.com/in/username"}' > /dev/null
curl -s -X PATCH "$API/site_config?key=eq.social_email" -H "$AUTH" -H "Content-Type: application/json" \
  -d '{"value": "hello@example.com"}' > /dev/null
echo "  Done"

echo ""
echo "=== Done ==="
