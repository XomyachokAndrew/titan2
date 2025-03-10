import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { UserService } from '@controllers/user.service'; 

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(UserService); // Получаем сервис через inject()
  const token = authService.getToken();

  if (token) {
    // Клонируем запрос и добавляем заголовок Authorization
    const cloned = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${token}`),
    });
    return next(cloned);
  }

  // Если токена нет, просто передаем запрос дальше
  return next(req);
};