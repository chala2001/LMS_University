$baseUrl = "http://localhost:8080/api"
$headers = @{ "Content-Type" = "application/json" }

Write-Host "--- Start Backend API Testing ---" -ForegroundColor Cyan

# 1. Register User 1
Write-Host "`n1. Testing User Registration..."
$regBody = @{
    firstName = "John"
    lastName = "Doe"
    email = "johndoe@example.com"
    password = "password123"
    role = "STUDENT"
} | ConvertTo-Json
$regResponse = Invoke-RestMethod -Uri "$baseUrl/users/register" -Method Post -Body $regBody -Headers $headers -ErrorAction Stop
Write-Host "Register Response: $($regResponse | ConvertTo-Json -Depth 2)" -ForegroundColor Green

# 2. Login User 1 -> Get Token
Write-Host "`n2. Testing User Login..."
$loginBody = @{
    email = "johndoe@example.com"
    password = "password123"
} | ConvertTo-Json
$token = Invoke-RestMethod -Uri "$baseUrl/users/login" -Method Post -Body $loginBody -Headers $headers -ErrorAction Stop
Write-Host "Login successful. Token acquired." -ForegroundColor Green

# Auth Header with Bearer Token
$authHeaders = @{ 
    "Content-Type" = "application/json"
    "Authorization" = "Bearer $token" 
}

# 3. Get Me
Write-Host "`n3. Testing Get Current User Profile..."
$me = Invoke-RestMethod -Uri "$baseUrl/users/me" -Method Get -Headers $authHeaders -ErrorAction Stop
Write-Host "User Profile: $($me | ConvertTo-Json -Depth 2)" -ForegroundColor Green

# 4. Create Post
Write-Host "`n4. Testing Create Post..."
$postBody = @{
    title = "Test Post"
    content = "This is a test post content."
} | ConvertTo-Json
$post = Invoke-RestMethod -Uri "$baseUrl/posts" -Method Post -Body $postBody -Headers $authHeaders -ErrorAction Stop
Write-Host "Post Created: $($post | ConvertTo-Json)" -ForegroundColor Green
$postId = $post.id

# 5. Get Posts
Write-Host "`n5. Testing Get All Posts..."
$postsList = Invoke-RestMethod -Uri "$baseUrl/posts" -Method Get -Headers $authHeaders -ErrorAction Stop
Write-Host "Posts List Count: $($postsList.Length)" -ForegroundColor Green

# 6. Like Post
Write-Host "`n6. Testing Like Post (Post ID: $postId)..."
$like = Invoke-RestMethod -Uri "$baseUrl/posts/$postId/like" -Method Post -Headers $authHeaders -ErrorAction Stop
Write-Host "Like Response: $like" -ForegroundColor Green

# 7. Add Comment
Write-Host "`n7. Testing Add Comment..."
$commentBody = @{
    content = "This is a great test post."
} | ConvertTo-Json
$comment = Invoke-RestMethod -Uri "$baseUrl/posts/$postId/comments" -Method Post -Body $commentBody -Headers $authHeaders -ErrorAction Stop
Write-Host "Comment Added: $($comment | ConvertTo-Json)" -ForegroundColor Green

# 8. Create Research Project
Write-Host "`n8. Testing Create Research Project..."
$research = Invoke-RestMethod -Uri "$baseUrl/research?title=AIProject&description=AI_Research" -Method Post -Headers $authHeaders -ErrorAction Stop
Write-Host "Research Project Created: $($research | ConvertTo-Json)" -ForegroundColor Green
$researchId = $research.id

# 9. Get Research Projects
Write-Host "`n9. Testing Get All Research Projects..."
$researchList = Invoke-RestMethod -Uri "$baseUrl/research" -Method Get -Headers $authHeaders -ErrorAction Stop
Write-Host "Research Projects List Count: $($researchList.Length)" -ForegroundColor Green

# 10. Create Job
Write-Host "`n10. Testing Create Job..."
$jobBody = @{
    title = "Software Engineer Intern"
    description = "Test Description"
    requirements = "Java, Spring Boot"
    type = "INTERNSHIP"
} | ConvertTo-Json
$job = Invoke-RestMethod -Uri "$baseUrl/jobs" -Method Post -Body $jobBody -Headers $authHeaders -ErrorAction Stop
Write-Host "Job Created: $($job | ConvertTo-Json)" -ForegroundColor Green
$jobId = $job.id

# 11. Apply to Job
Write-Host "`n11. Testing Apply to Job..."
$apply = Invoke-RestMethod -Uri "$baseUrl/jobs/$jobId/apply" -Method Post -Headers $authHeaders -ErrorAction Stop
Write-Host "Job Application Response: $apply" -ForegroundColor Green

# 12. Create Event
Write-Host "`n12. Testing Create Event..."
$eventBody = @{
    title = "Tech Conference"
    description = "Annual Test Conference"
    location = "Main Hall"
    date = "2026-10-10"
} | ConvertTo-Json
$event = Invoke-RestMethod -Uri "$baseUrl/events" -Method Post -Body $eventBody -Headers $authHeaders -ErrorAction Stop
Write-Host "Event Created: $($event | ConvertTo-Json)" -ForegroundColor Green
$eventId = $event.id

# 13. RSVP to Event
Write-Host "`n13. Testing RSVP to Event..."
$rsvp = Invoke-RestMethod -Uri "$baseUrl/events/$eventId/rsvp?status=GOING" -Method Post -Headers $authHeaders -ErrorAction Stop
Write-Host "Event RSVP Response: $rsvp" -ForegroundColor Green

# 14. Analytics
Write-Host "`n14. Testing Analytics Dashboard..."
$analytics = Invoke-RestMethod -Uri "$baseUrl/analytics" -Method Get -Headers $authHeaders -ErrorAction Stop
Write-Host "Analytics Dashboard Data: $($analytics | ConvertTo-Json)" -ForegroundColor Green

# 15. Notifications
Write-Host "`n15. Testing Get Notifications..."
$notifications = Invoke-RestMethod -Uri "$baseUrl/notifications" -Method Get -Headers $authHeaders -ErrorAction Stop
Write-Host "Notifications Count: $($notifications.Length)" -ForegroundColor Green

Write-Host "`n--- Testing Completed Successfully ---" -ForegroundColor Cyan
