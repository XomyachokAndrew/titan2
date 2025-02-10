import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { LoginComponent } from './pages/login/login.component';
import { OfficesComponent } from './pages/offices/offices.component';
import { RegistrationComponent } from './pages/registration/registration.component';
import { OfficeComponent } from './pages/offices/office/office.component';

export const routes: Routes = [
    {path: '', component: HomeComponent},
    {path: 'login', component: LoginComponent},
    {path: 'offices', component: OfficesComponent},
    {path: 'registration', component: RegistrationComponent},
    {path: 'offices/:id', component: OfficeComponent}
];
