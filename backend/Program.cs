using backend.Data;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens; // ���������, ��� �� �������� ���������� using ��� ������ ���������
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();

// ����������� ��������� ���� ������ ��� PostgreSQL
builder.Services.AddDbContext<Context>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// �������� CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowSpecificOrigin",
        builder =>
        {
            builder.WithOrigins("http://localhost:4200") // URL �������
                   .AllowAnyMethod()
                   .AllowAnyHeader();
        });
});

// ��������� JWT ��������������
var key = builder.Configuration["JwtSettings:SecretKey"]; // ������ ����� �� ������������

if (string.IsNullOrEmpty(key))
{
    throw new Exception("JWT Secret Key is not configured in appsettings.json");
}

builder.Services.AddAuthentication(x =>
{
    x.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    x.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(x =>
{
    x.RequireHttpsMetadata = false; // ���������� false ��� ������������� HTTP
    x.SaveToken = true;
    x.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key)), // ����������� ������ � ������ ������
        ValidateIssuer = false, // ���������� true, ���� �� ������ ��������� ��������
        ValidateAudience = false // ���������� true, ���� �� ������ ��������� ���������
    };
});

// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseStaticFiles(); // Это позволяет использовать файлы из wwwroot

app.UseCors("AllowSpecificOrigin"); // ��������� CORS

app.UseAuthentication(); // �������� ��������������
app.UseAuthorization(); // �������� �����������

app.MapControllers();

app.Run();
