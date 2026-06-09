param(
  [Parameter(Mandatory = $true)]
  [string]$BucketName,

  [string]$StackName = "universal-converter-static-site",
  [string]$Region = "us-east-1"
)

$ErrorActionPreference = "Stop"

Write-Host "Deploying CloudFormation stack $StackName in $Region..."
aws cloudformation deploy `
  --stack-name $StackName `
  --template-file cloudformation.yml `
  --parameter-overrides SiteBucketName=$BucketName `
  --region $Region

Write-Host "Uploading site files to s3://$BucketName..."
aws s3 sync . "s3://$BucketName" `
  --delete `
  --exclude "backend/*" `
  --exclude "README.md" `
  --exclude "cloudformation.yml" `
  --exclude "deploy-aws.ps1" `
  --region $Region

$distributionId = aws cloudformation describe-stacks `
  --stack-name $StackName `
  --region $Region `
  --query "Stacks[0].Outputs[?OutputKey=='DistributionId'].OutputValue" `
  --output text

$domain = aws cloudformation describe-stacks `
  --stack-name $StackName `
  --region $Region `
  --query "Stacks[0].Outputs[?OutputKey=='CloudFrontDomain'].OutputValue" `
  --output text

if ($distributionId) {
  Write-Host "Creating CloudFront invalidation..."
  aws cloudfront create-invalidation --distribution-id $distributionId --paths "/*" | Out-Null
}

Write-Host "Done. CloudFront URL: https://$domain"
