using backend.Data;
using backend.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Configuration;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UserController : ControllerBase
    {
        private readonly Context _context; // Замените YourDbContext на ваш контекст базы данных
        private readonly IConfiguration _configuration;

        public UserController(Context context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] UserRegistrationDto registrationDto)
        {
            // Проверяем, что логин не занят
            if (await _context.Users.AnyAsync(u => u.Login == registrationDto.Login))
            {
                return BadRequest("Логин уже занят.");
            }

            // Создаем экземпляр CredentialHasher
            CredentialHasher credentialHasher = new CredentialHasher();
            credentialHasher.SetCredentials(registrationDto.Login, registrationDto.Password);

            // Хешируем пароль
            byte[] hashedPassword = credentialHasher.HashCredentials();

            // Создаем нового пользователя
            User newUser = new User
            {
                Login = registrationDto.Login,
                Password = hashedPassword, // Преобразуем массив байт в строку для хранения
                Name = registrationDto.Name,
                Surname = registrationDto.Surname,
                Patronymic = registrationDto.Patronymic,
                IsAdmin = false // По умолчанию, можно изменить по необходимости
            };

            // Добавляем пользователя в контекст и сохраняем изменения
            _context.Users.Add(newUser);
            await _context.SaveChangesAsync();

            return Ok("Пользователь успешно зарегистрирован.");
        }

        // Метод для авторизации пользователя
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] UserLoginDto loginDto)
        {
            // Ищем пользователя по логину
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Login == loginDto.Login);
            if (user == null)
            {
                return Unauthorized("Неверный логин или пароль.");
            }

            // Проверка пароля
            CredentialHasher credentialHasher = new CredentialHasher();
            if (!credentialHasher.VerifyPassword(loginDto.Password, user.Password, loginDto.Login))
            {
                return Unauthorized("Неверный логин или пароль.");
            }

            // Получаем секретный ключ из конфигурации
            var key = Encoding.UTF8.GetBytes(_configuration["JwtSettings:SecretKey"]); // Чтение ключа из конфигурации
            var tokenHandler = new JwtSecurityTokenHandler(); // Создаем обработчик токенов

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new Claim[]
                {
                    new Claim(ClaimTypes.Name, user.Login) // Добавляем имя пользователя в токен
                }),
                Expires = DateTime.UtcNow.AddHours(1), // Устанавливаем срок действия токена
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key),
                                                           SecurityAlgorithms.HmacSha256Signature) // Подписываем токен
            };

            var token = tokenHandler.CreateToken(tokenDescriptor); // Создаем токен
            return Ok(new { Token = tokenHandler.WriteToken(token) }); // Возвращаем токен клиенту
        }

    }

    // DTO для регистрации пользователя
    public class UserRegistrationDto
    {
        public string Name { get; set; } = null!;
        public string Surname { get; set; } = null!;
        public string? Patronymic { get; set; }
        public string Login { get; set; } = null!;
        public string Password { get; set; } = null!;
    }

    // DTO для входа пользователя
    public class UserLoginDto
    {
        public string Login { get; set; } = null!;
        public string Password { get; set; } = null!;
    }
}

