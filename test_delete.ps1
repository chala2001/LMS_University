$loginData = @{ email = 'admin@example.com'; password = 'password' }
$loginResp = Invoke-RestMethod -Uri 'http://localhost:8080/api/users/login' -Method Post -Body ($loginData | ConvertTo-Json) -ContentType 'application/json'

$headers = @{ 'Authorization' = "Bearer $loginResp" }

Write-Output "Trying to delete user 3..."
try {
    $delResp = Invoke-RestMethod -Uri 'http://localhost:8080/api/users/3' -Method Delete -Headers $headers -SkipHttpErrorCheck
    Write-Output "Response:"
    $delResp
} catch {
    Write-Output "Exception:"
    $_.Exception.Response
}
