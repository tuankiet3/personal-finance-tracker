import { Controller, Get, Render, Res } from '@nestjs/common';

@Controller()
export class ViewsController {
  @Get('/')
  indexRedirect(@Res() res) {
    return res.redirect('/auth');
  }

  @Get('auth')
  @Render('auth')
  authPage() {
    return { title: 'Đăng nhập', layout: 'layout' };
  }

  @Get('dashboard')
  @Render('dashboard')
  dashboardPage() {
    return { title: 'Tổng quan', layout: 'layout' };
  }

  @Get('transactions')
  @Render('transactions')
  transactionsPage() {
    return { title: 'Giao dịch', layout: 'layout' };
  }

  @Get('categories')
  @Render('categories')
  categoriesPage() {
    return { title: 'Danh mục', layout: 'layout' };
  }

  @Get('budgets')
  @Render('budgets')
  budgetsPage() {
    return { title: 'Ngân sách', layout: 'layout' };
  }
}
