FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /back

COPY *.csproj ./
RUN dotnet restore

COPY . ./

RUN find . -type f -name '*.dev' -exec bash -c 'mv "$0" "${0/.dev}"' {} \;

RUN dotnet publish -c Release -o out

# Run migrations
RUN dotnet tool install --global dotnet-ef
# RUN dotnet ef migrations add InitialCreate
# RUN dotnet ef database update

FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /back

RUN apt-get update && \
    apt-get install -y --no-install-recommends fonts-liberation && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

COPY --from=build /back/out .

# Set environment variables for the database connection

ENTRYPOINT [ "dotnet", "backend.dll" ]

ENV ConnectionStrings__DefaultConnection "Host=db;Database=mydatabase;Username=myuser;Password=mypassword"
ENV ASPNETCORE_URLS=http://0.0.0.0:8080