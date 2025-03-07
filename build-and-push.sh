#!/bin/bash
set -e
# Check for environment argument
if [[ "$1" != "dev" && "$1" != "prod" ]]; then
    echo "Error: Please specify environment (dev or prod) as first argument"
    echo "Usage: $0 <dev|prod>"
    exit 1
fi

# Set account based on environment
if [[ "$1" == "dev" ]]; then
    ACCOUNT="371717752603"  # sandbox account
else
    ACCOUNT="001138754299"  # prod account
fi

# Set platform arguments if on ARM
platform=''
platformarg=''
if [[ "$(uname -p)" == "arm" ]]; then
    platform='--platform'
    platformarg='linux/amd64'
fi

# Login to ECR
set -x
aws ecr get-login-password --region us-west-2 | docker login --username AWS --password-stdin ${ACCOUNT}.dkr.ecr.us-west-2.amazonaws.com

# Build and push each image
image_name="eco-solver"
dockerfile="./Dockerfile"
build_context="."

echo "Building ${image_name} using ${dockerfile}..."

# Build the image with correct context
docker build "${build_context}" -f "${dockerfile}" \
    -t "${ACCOUNT}.dkr.ecr.us-west-2.amazonaws.com/${image_name}:latest" \
    ${platform:+"$platform=$platformarg"}

# Push latest tag
docker push "${ACCOUNT}.dkr.ecr.us-west-2.amazonaws.com/${image_name}:latest"

