FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /back

COPY *.csproj ./
RUN dotnet restore

COPY . ./
RUN dotnet publish -c Release -o out

# Run migrations
RUN dotnet tool install --global dotnet-ef
# RUN dotnet ef migrations add InitialCreate
# RUN dotnet ef database update

FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /back
COPY --from=build /back/out .

# Set environment variables for the database connection

ENTRYPOINT [ "dotnet", "backend.dll" ]

ENV ConnectionStrings__DefaultConnection "Host=db;Database=mydatabase;Username=myuser;Password=mypassword"
ENV ASPNETCORE_URLS=http://0.0.0.0:8080