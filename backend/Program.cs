using backend.Data;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// Добавление сервисов в контейнер.
builder.Services.AddControllers();

// Регистрация HttpClient
builder.Services.AddHttpClient();

// Настройка Entity Framework для использования PostgreSQL
builder.Services.AddDbContext<Context>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// Настройка CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowSpecificOrigin",
        builder =>
        {
            builder.WithOrigins("http://localhost:4200") // URL клиентского приложения
                   .AllowAnyMethod()
                   .AllowAnyHeader();
        });
});

// Настройка аутентификации JWT
var key = builder.Configuration["JwtSettings:SecretKey"]; // Секретный ключ для JWT

if (string.IsNullOrEmpty(key))
{
    throw new Exception("Секретный ключ JWT не настроен в appsettings.json");
}

builder.Services.AddAuthentication(x =>
{
    x.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    x.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(x =>
{
    x.RequireHttpsMetadata = false; // Установите false для целей разработки
    x.SaveToken = true;
    x.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key)), // Секретный ключ для подписи токена
        ValidateIssuer = false, // Установите true, если необходимо проверять издателя токена
        ValidateAudience = false // Установите true, если необходимо проверять аудиторию токена
    };
});

// Узнайте больше о настройке Swagger/OpenAPI по адресу http://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    // Укажите путь к XML файлу документации
    var xmlFile = $"{Assembly.GetExecutingAssembly().GetName().Name}.xml";
    var xmlPath = Path.Combine(AppContext.BaseDirectory, xmlFile);
    c.IncludeXmlComments(xmlPath); // Включение XML документации
});

var app = builder.Build();

// Настройка конвейера HTTP-запросов.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseStaticFiles();

app.UseCors("AllowSpecificOrigin"); // Включение CORS

app.UseAuthentication(); // Включение аутентификации
app.UseAuthorization(); // Включение авторизации

app.MapControllers();

app.Run();