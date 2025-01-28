using backend.Data;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens; // Убедитесь, что вы добавили правильный using для вашего контекста
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();

// Регистрация контекста базы данных для PostgreSQL
builder.Services.AddDbContext<Context>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// Настройка JWT аутентификации
var key = builder.Configuration["JwtSettings:SecretKey"]; // Чтение ключа из конфигурации

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
    x.RequireHttpsMetadata = false; // Установите false для использования HTTP
    x.SaveToken = true;
    x.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key)), // Преобразуем строку в массив байтов
        ValidateIssuer = false, // Установите true, если вы хотите проверять издателя
        ValidateAudience = false // Установите true, если вы хотите проверять аудиторию
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

app.UseAuthentication(); // Включаем аутентификацию
app.UseAuthorization(); // Включаем авторизацию

app.UseAuthorization();

app.MapControllers();

app.Run();
