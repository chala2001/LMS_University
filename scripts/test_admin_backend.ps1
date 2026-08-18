$baseUrl = "http://localhost:8080/api"
$headers = @{ "Content-Type" = "application/json" }

Write-Host "--- Start Admin API Testing ---" -ForegroundColor Cyan

# 1. Register Admin User
Write-Host "`n1. Testing Admin User Registration..."
$regBody = @{
    firstName = "Admin"
    lastName = "User"
    email = "admin@example.com"
    password = "adminpassword"
    role = "ADMIN"
} | ConvertTo-Json
try {
    $regResponse = Invoke-RestMethod -Uri "$baseUrl/users/register" -Method Post -Body $regBody -Headers $headers -ErrorAction Stop
    Write-Host "Admin Register Response: $($regResponse | ConvertTo-Json -Depth 2)" -ForegroundColor Green
} catch {
    Write-Host "Admin Registration failed or already exists. Attempting login anyway." -ForegroundColor Yellow
}

# 2. Login Admin User -> Get Token
Write-Host "`n2. Testing Admin User Login..."
$loginBody = @{
    email = "admin@example.com"
    password = "adminpassword"
} | ConvertTo-Json
$token = Invoke-RestMethod -Uri "$baseUrl/users/login" -Method Post -Body $loginBody -Headers $headers -ErrorAction Stop
Write-Host "Admin Login successful. Token acquired." -ForegroundColor Green

# Auth Header with Bearer Token
$authHeaders = @{ 
    "Content-Type" = "application/json"
    "Authorization" = "Bearer $token" 
}

# 3. Create Job (Admin Only)
Write-Host "`n3. Testing Create Job as Admin..."
$jobBody = @{
    title = "Senior Developer"
    description = "Senior Java role"
    requirements = "Java, Spring Boot"
    type = "FULL_TIME"
} | ConvertTo-Json
$job = Invoke-RestMethod -Uri "$baseUrl/jobs" -Method Post -Body $jobBody -Headers $authHeaders -ErrorAction Stop
Write-Host "Job Created: $($job | ConvertTo-Json)" -ForegroundColor Green
$jobId = $job.id

# 4. Apply to Job
Write-Host "`n4. Testing Apply to Job..."
$apply = Invoke-RestMethod -Uri "$baseUrl/jobs/$jobId/apply" -Method Post -Headers $authHeaders -ErrorAction Stop
Write-Host "Job Application Response: $apply" -ForegroundColor Green

# 5. Create Event (Admin Only)
Write-Host "`n5. Testing Create Event as Admin..."
$eventBody = @{
    title = "Admin Tech Conference"
    description = "Admin Conference"
    location = "Virtual"
    date = "2026-12-12"
} | ConvertTo-Json
$event = Invoke-RestMethod -Uri "$baseUrl/events" -Method Post -Body $eventBody -Headers $authHeaders -ErrorAction Stop
Write-Host "Event Created: $($event | ConvertTo-Json)" -ForegroundColor Green
$eventId = $event.id

# 6. RSVP to Event
Write-Host "`n6. Testing RSVP to Event..."
$rsvp = Invoke-RestMethod -Uri "$baseUrl/events/$eventId/rsvp?status=GOING" -Method Post -Headers $authHeaders -ErrorAction Stop
Write-Host "Event RSVP Response: $rsvp" -ForegroundColor Green

Write-Host "`n--- Admin Testing Completed Successfully ---" -ForegroundColor Cyan
