$loginData1 = @{ email = 'admin@example.com'; password = 'password' }
$tokenAdmin = Invoke-RestMethod -Uri 'http://localhost:8080/api/users/login' -Method Post -Body ($loginData1 | ConvertTo-Json) -ContentType 'application/json'

$headersAdmin = @{ 'Authorization' = "Bearer $tokenAdmin" }

# Get conversation with user 2
$res = Invoke-RestMethod -Uri 'http://localhost:8080/api/messages/2' -Method Get -Headers $headersAdmin
Write-Output "Admin conversation with 2:"
$res | ConvertTo-Json -Depth 5
