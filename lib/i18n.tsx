"use client"

import { createContext, useContext, useState, useEffect, useMemo, useCallback, type ReactNode } from "react"

type Language = "es" | "en"

interface Translations {
  [key: string]: {
    es: string
    en: string
  }
}

const translations: Translations = {
  // Navigation
  "nav.dashboard": { es: "Dashboard", en: "Dashboard" },
  "nav.lotteries": { es: "Sorteos", en: "Raffles" },
  "nav.wallet": { es: "Billetera", en: "Wallet" },
  "nav.results": { es: "Resultados", en: "Results" },
  "nav.history": { es: "Historial", en: "History" },
  "nav.tasks": { es: "Tareas", en: "Tasks" },
  "nav.settings": { es: "Configuración", en: "Settings" },
  "nav.logout": { es: "Cerrar Sesión", en: "Logout" },
  "nav.adminPanel": { es: "Admin Panel", en: "Admin Panel" },
  "nav.referrals": { es: "Referidos", en: "Referrals" },

  // Landing Page
  "landing.tagline": {
    es: "🎉 Sorteos cada hora con premios garantizados",
    en: "🎉 Hourly raffles with guaranteed prizes",
  },
  "landing.hero.title": { es: "Gana", en: "Win" },
  "landing.hero.subtitle": {
    es: "en sorteos automáticos",
    en: "in automatic raffles",
  },
  "landing.hero.description": {
    es: "Compra tickets, participa en sorteos cada hora y gana premios en USDT. Sistema 100% transparente con resultados automáticos y pagos instantáneos.",
    en: "Buy tickets, participate in hourly raffles and win USDT prizes. 100% transparent system with automatic results and instant payments.",
  },
  "landing.cta.start": { es: "Comenzar Ahora", en: "Start Now" },
  "landing.cta.viewRaffles": { es: "Ver Sorteos Activos", en: "View Active Raffles" },
  "landing.stats.prizesDelivered": { es: "Premios Entregados", en: "Prizes Delivered" },
  "landing.stats.activeRaffles": { es: "Sorteos Activos", en: "Active Raffles" },
  "landing.stats.activeUsers": { es: "Usuarios Activos", en: "Active Users" },

  // Auth
  "auth.login": { es: "Iniciar Sesión", en: "Login" },
  "auth.register": { es: "Registrarse", en: "Register" },
  "auth.email": { es: "Correo Electrónico", en: "Email" },
  "auth.password": { es: "Contraseña", en: "Password" },
  "auth.name": { es: "Nombre", en: "Name" },

  // Features
  "features.title": { es: "¿Por qué elegirnos?", en: "Why choose us?" },
  "features.subtitle": {
    es: "La plataforma más confiable para sorteos de USDT",
    en: "The most reliable platform for USDT raffles",
  },
  "features.hourly.title": { es: "Sorteos Cada Hora", en: "Hourly Raffles" },
  "features.hourly.description": {
    es: "Nuevos sorteos cada hora con premios garantizados. Más oportunidades de ganar todos los días.",
    en: "New raffles every hour with guaranteed prizes. More chances to win every day.",
  },
  "features.wallet.title": { es: "Billetera Integrada", en: "Integrated Wallet" },
  "features.wallet.description": {
    es: "Cada usuario tiene su propia billetera crypto con depósitos automáticos y retiros instantáneos.",
    en: "Each user has their own crypto wallet with automatic deposits and instant withdrawals.",
  },
  "features.transparent.title": { es: "100% Transparente", en: "100% Transparent" },
  "features.transparent.description": {
    es: "Sistema automático de resultados verificable. Todos los sorteos son justos y transparentes.",
    en: "Verifiable automatic results system. All raffles are fair and transparent.",
  },
  "features.prizes.title": { es: "Premios Garantizados", en: "Guaranteed Prizes" },
  "features.prizes.description": {
    es: "Cada sorteo tiene un premio mínimo garantizado. Siempre hay ganadores en cada ronda.",
    en: "Each raffle has a guaranteed minimum prize. There are always winners in each round.",
  },
  "features.instant.title": { es: "Pagos Instantáneos", en: "Instant Payments" },
  "features.instant.description": {
    es: "Los ganadores reciben sus premios automáticamente en su billetera al finalizar el sorteo.",
    en: "Winners receive their prizes automatically in their wallet when the raffle ends.",
  },
  "features.accessible.title": { es: "Tickets Accesibles", en: "Accessible Tickets" },
  "features.accessible.description": {
    es: "Precios de tickets desde 1 USDT. Compra múltiples tickets para aumentar tus probabilidades.",
    en: "Ticket prices from 1 USDT. Buy multiple tickets to increase your chances.",
  },

  // CTA
  "cta.title": { es: "¿Listo para ganar?", en: "Ready to win?" },
  "cta.description": {
    es: "Únete a miles de usuarios que ya están ganando USDT en nuestros sorteos diarios",
    en: "Join thousands of users who are already winning USDT in our daily raffles",
  },
  "cta.button": { es: "Crear Cuenta Gratis", en: "Create Free Account" },

  // Footer
  "footer.copyright": { es: "Todos los derechos reservados.", en: "All rights reserved." },
  "footer.description": {
    es: "Raffle USDT es la plataforma líder de sorteos automáticos con premios en USDT. Sistema 100% transparente, pagos instantáneos y sorteos cada hora.",
    en: "Raffle USDT is the leading automatic raffle platform with USDT prizes. 100% transparent system, instant payments and hourly raffles.",
  },
  "footer.privacy": { es: "Privacidad", en: "Privacy" },
  "footer.terms": { es: "Términos de Uso", en: "Terms of Use" },

  // Dashboard
  "dashboard.welcome": { es: "Bienvenido", en: "Welcome" },
  "dashboard.summary": { es: "Aquí está tu resumen de actividad", en: "Here's your activity summary" },
  "dashboard.totalBalance": { es: "Balance Total", en: "Total Balance" },
  "dashboard.activeTickets": { es: "Tickets Activos", en: "Active Tickets" },
  "dashboard.prizesWon": { es: "Premios Ganados", en: "Prizes Won" },
  "dashboard.totalWon": { es: "Total Ganado", en: "Total Won" },
  "dashboard.quickActions": { es: "Acciones Rápidas", en: "Quick Actions" },
  "dashboard.buyTickets": { es: "Comprar Tickets", en: "Buy Tickets" },
  "dashboard.buyTickets.desc": { es: "Participa en sorteos activos", en: "Participate in active raffles" },
  "dashboard.depositUSDT": { es: "Depositar USDT", en: "Deposit USDT" },
  "dashboard.depositUSDT.desc": { es: "Añade fondos a tu billetera", en: "Add funds to your wallet" },
  "dashboard.viewHistory": { es: "Ver Historial", en: "View History" },
  "dashboard.viewHistory.desc": { es: "Revisa tus transacciones", en: "Review your transactions" },
  "dashboard.activeLotteries": { es: "Sorteos Activos", en: "Active Raffles" },
  "dashboard.viewAll": { es: "Ver todos", en: "View all" },
  "dashboard.participants": { es: "participantes", en: "participants" },
  "dashboard.timeRemaining": { es: "Tiempo restante", en: "Time remaining" },
  "dashboard.recentActivity": { es: "Actividad Reciente", en: "Recent Activity" },
  "dashboard.noActivity": { es: "No hay actividad reciente", en: "No recent activity" },
  "dashboard.startBuying": { es: "Comienza comprando tickets para sorteos", en: "Start by buying raffle tickets" },

  // Wallet
  "wallet.title": { es: "Mi Billetera", en: "My Wallet" },
  "wallet.subtitle": { es: "Gestiona tus fondos y transacciones", en: "Manage your funds and transactions" },
  "wallet.totalBalance": { es: "Balance Total", en: "Total Balance" },
  "wallet.deposit": { es: "Depositar", en: "Deposit" },
  "wallet.withdraw": { es: "Retirar", en: "Withdraw" },
  "wallet.transactionHistory": { es: "Historial de Transacciones", en: "Transaction History" },
  "wallet.filter.all": { es: "Todos", en: "All" },
  "wallet.filter.deposits": { es: "Depósitos", en: "Deposits" },
  "wallet.filter.withdrawals": { es: "Retiros", en: "Withdrawals" },
  "wallet.noTransactions": { es: "No hay transacciones", en: "No transactions" },
  "wallet.noTransactions.desc": {
    es: "Tus depósitos y retiros aparecerán aquí",
    en: "Your deposits and withdrawals will appear here",
  },
  "wallet.address": { es: "Dirección de Billetera", en: "Wallet Address" },
  "wallet.network": { es: "Red", en: "Network" },
  "wallet.status": { es: "Estado", en: "Status" },
  "wallet.active": { es: "Activa", en: "Active" },
  "wallet.deposit.desc": { es: "Añade fondos a tu billetera", en: "Add funds to your wallet" },
  "wallet.withdraw.desc": { es: "Envía fondos a otra billetera", en: "Send funds to another wallet" },
  "wallet.deposit.info": { es: "Información importante:", en: "Important information:" },
  "wallet.deposit.auto": {
    es: "Los depósitos se procesan automáticamente",
    en: "Deposits are processed automatically",
  },
  "wallet.deposit.time": { es: "Tiempo de confirmación: 1-5 minutos", en: "Confirmation time: 1-5 minutes" },
  "wallet.deposit.min": { es: "Depósito mínimo: 10 USDT", en: "Minimum deposit: 10 USDT" },
  "wallet.amount": { es: "Cantidad (USDT)", en: "Amount (USDT)" },
  "wallet.depositButton": { es: "Depositar USDT", en: "Deposit USDT" },
  "wallet.withdraw.min": { es: "Retiro mínimo: 20 USDT", en: "Minimum withdrawal: 20 USDT" },
  "wallet.withdraw.fee": { es: "Comisión de red: 1 USDT", en: "Network fee: 1 USDT" },
  "wallet.withdraw.instant": { es: "Procesamiento instantáneo", en: "Instant processing" },
  "wallet.destinationAddress": { es: "Dirección de destino", en: "Destination address" },
  "wallet.availableBalance": { es: "Balance disponible", en: "Available balance" },
  "wallet.withdrawButton": { es: "Retirar USDT", en: "Withdraw USDT" },
  "wallet.addressCopied": { es: "Dirección copiada", en: "Address copied" },
  "wallet.addressCopied.desc": {
    es: "La dirección de tu billetera ha sido copiada al portapapeles",
    en: "Your wallet address has been copied to clipboard",
  },
  "wallet.depositSuccess": { es: "Depósito exitoso", en: "Deposit successful" },
  "wallet.depositSuccess.desc": {
    es: "Se han añadido {amount} USDT a tu billetera",
    en: "{amount} USDT has been added to your wallet",
  },
  "wallet.withdrawSuccess": { es: "Retiro procesado", en: "Withdrawal processed" },
  "wallet.withdrawSuccess.desc": {
    es: "Se han retirado {amount} USDT de tu billetera",
    en: "{amount} USDT has been withdrawn from your wallet",
  },
  "wallet.error": { es: "Error", en: "Error" },
  "wallet.error.invalidAmount": { es: "Ingresa una cantidad válida", en: "Enter a valid amount" },
  "wallet.error.insufficientFunds": { es: "Fondos insuficientes", en: "Insufficient funds" },
  "wallet.error.insufficientFunds.desc": {
    es: "No tienes suficiente balance para este retiro",
    en: "You don't have enough balance for this withdrawal",
  },
  "wallet.error.noAddress": { es: "Ingresa una dirección de destino", en: "Enter a destination address" },
  "wallet.withdraw.processing": { es: "Procesando...", en: "Processing..." },
  "wallet.withdraw.processingTitle": { es: "Procesando Retiro", en: "Processing Withdrawal" },
  "wallet.withdraw.processingDesc": {
    es: "Tu retiro está siendo procesado de forma segura...",
    en: "Your withdrawal is being processed securely...",
  },
  "wallet.withdraw.successTitle": { es: "¡Retiro Exitoso!", en: "Withdrawal Successful!" },
  "wallet.withdraw.successDesc": {
    es: "Tu retiro ha sido procesado y enviado a tu billetera",
    en: "Your withdrawal has been processed and sent to your wallet",
  },
  "wallet.withdraw.pendingTitle": { es: "Retiro Pendiente", en: "Withdrawal Pending" },
  "wallet.withdraw.pendingDesc": {
    es: "Tu retiro está pendiente de aprobación por el administrador",
    en: "Your withdrawal is pending admin approval",
  },
  "wallet.withdraw.title": { es: "Retirar USDT", en: "Withdraw USDT" },
  "wallet.withdraw.recipientAddress": { es: "Dirección del Destinatario", en: "Recipient Address" },
  "wallet.withdraw.recipientPlaceholder": { es: "Ingresa la dirección de billetera", en: "Enter wallet address" },
  "wallet.withdraw.amount": { es: "Monto", en: "Amount" },
  "wallet.withdraw.amountPlaceholder": { es: "Ingresa el monto", en: "Enter amount" },
  "wallet.withdraw.max": { es: "Máximo", en: "Max" },
  "wallet.withdraw.availableBalance": { es: "Balance disponible", en: "Available balance" },
  "wallet.withdraw.selectToken": { es: "Seleccionar Token", en: "Select Token" },
  "wallet.withdraw.selectNetwork": { es: "Seleccionar Red", en: "Select Network" },
  "wallet.withdraw.network.bsc": { es: "BSC (BEP-20)", en: "BSC (BEP-20)" },
  "wallet.withdraw.network.trc20": { es: "TRON (TRC-20)", en: "TRON (TRC-20)" },
  "wallet.withdraw.youWillReceive": { es: "Recibirás", en: "You will receive" },
  "wallet.withdraw.fee": { es: "Comisión", en: "Fee" },
  "wallet.withdraw.button": { es: "Retirar", en: "Withdraw" },
  "wallet.withdraw.all": { es: "Todo", en: "All" },
  "wallet.withdraw.minAmountPlaceholder": { es: "Mínimo: 10 USDT", en: "Minimum: 10 USDT" },
  "wallet.deposit.title": { es: "Depositar USDT", en: "Deposit USDT" },
  "wallet.deposit.selectNetwork": { es: "Selecciona la red para depositar", en: "Select network to deposit" },
  "wallet.deposit.selectCurrency": { es: "Seleccionar Moneda", en: "Select Currency" },
  "wallet.deposit.network.bsc": { es: "BSC (BEP-20)", en: "BSC (BEP-20)" },
  "wallet.deposit.network.trc20": { es: "TRON (TRC-20)", en: "TRON (TRC-20)" },
  "wallet.deposit.scanQR": { es: "Escanea el código QR", en: "Scan QR code" },
  "wallet.deposit.address": { es: "Dirección de Depósito", en: "Deposit Address" },
  "wallet.deposit.confirmationTime": { es: "Tiempo de confirmación", en: "Confirmation time" },
  "wallet.deposit.confirmationTime.bsc": { es: "1-3 minutos", en: "1-3 minutes" },
  "wallet.deposit.confirmationTime.trc20": { es: "1-5 minutos", en: "1-5 minutes" },
  "wallet.deposit.minAmount": { es: "Monto mínimo", en: "Minimum amount" },
  "wallet.deposit.minAmountTooltip": {
    es: "Los depósitos inferiores a la cantidad mínima no se abonarán ni reembolsarán.",
    en: "Deposits below the minimum amount will not be credited or refunded.",
  },
  "wallet.deposit.important": { es: "Importante", en: "Important" },
  "wallet.deposit.warning": {
    es: "Solo envía USDT a esta dirección. Enviar otros tokens resultará en pérdida permanente de fondos.",
    en: "Only send USDT to this address. Sending other tokens will result in permanent loss of funds.",
  },

  // Transaction types
  "wallet.transaction.deposit": { es: "Depósito", en: "Deposit" },
  "wallet.transaction.withdrawal": { es: "Retiro", en: "Withdrawal" },
  "wallet.transaction.ticket_purchase": { es: "Compra de Ticket", en: "Ticket Purchase" },
  "wallet.transaction.prize_won": { es: "Premio Ganado", en: "Prize Won" },

  // Errors
  "wallet.error.invalidAddress": { es: "Dirección inválida", en: "Invalid address" },
  "wallet.error.invalidAmount": { es: "Monto inválido", en: "Invalid amount" },
  "wallet.error.insufficientBalance": { es: "Balance insuficiente", en: "Insufficient balance" },
  "wallet.error.minAmount": { es: "El monto mínimo es 10 USDT", en: "Minimum amount is 10 USDT" },

  // Success messages
  "wallet.success.addressCopied": { es: "Dirección copiada", en: "Address copied" },
  "wallet.success.withdrawalProcessed": { es: "Retiro procesado", en: "Withdrawal processed" },
  "wallet.success.withdrawalProcessed.desc": {
    es: "Tu retiro ha sido procesado exitosamente",
    en: "Your withdrawal has been processed successfully",
  },

  // Lottery
  "lottery.title": { es: "Sorteos de USDT", en: "USDT Raffles" },
  "lottery.subtitle": { es: "Compra tickets y gana premios cada hora", en: "Buy tickets and win prizes every hour" },
  "lottery.activeRaffles": { es: "Sorteos Activos", en: "Active Raffles" },
  "lottery.totalPrize": { es: "Premio Total Disponible", en: "Total Prize Available" },
  "lottery.upcomingRaffles": { es: "Próximos Sorteos", en: "Upcoming Raffles" },
  "lottery.active": { es: "Activos", en: "Active" },
  "lottery.upcoming": { es: "Próximos", en: "Upcoming" },
  "lottery.completed": { es: "Completados", en: "Completed" },
  "lottery.myTickets": { es: "Mis Tickets", en: "My Tickets" },
  "lottery.myTickets.title": { es: "Mis Tickets", en: "My Tickets" },
  "lottery.myTickets.raffle": { es: "Sorteo", en: "Raffle" },
  "lottery.myTickets.ticketNumbers": { es: "Números de Ticket", en: "Ticket Numbers" },
  "lottery.myTickets.purchaseDate": { es: "Fecha de Compra", en: "Purchase Date" },
  "lottery.myTickets.drawDate": { es: "Fecha del Sorteo", en: "Draw Date" },
  "lottery.myTickets.status": { es: "Estado", en: "Status" },
  "lottery.myTickets.status.active": { es: "Activo", en: "Active" },
  "lottery.myTickets.status.won": { es: "Ganado", en: "Won" },
  "lottery.myTickets.status.lost": { es: "Perdido", en: "Lost" },
  "lottery.myTickets.status.finished": { es: "Finalizado", en: "Finished" },
  "lottery.myTickets.viewResults": { es: "Ver Resultados", en: "View Results" },
  "lottery.myTickets.noTickets": { es: "No tienes tickets", en: "You have no tickets" },
  "lottery.myTickets.noTickets.desc": {
    es: "Compra tickets para participar en los sorteos",
    en: "Buy tickets to participate in raffles",
  },
  "lottery.noActive": { es: "No hay sorteos activos", en: "No active raffles" },
  "lottery.noActive.desc": {
    es: "Revisa los próximos sorteos o espera a que comience uno nuevo",
    en: "Check upcoming raffles or wait for a new one to start",
  },
  "lottery.noUpcoming": { es: "No hay sorteos próximos", en: "No upcoming raffles" },
  "lottery.noUpcoming.desc": {
    es: "Los nuevos sorteos se anunciarán pronto",
    en: "New raffles will be announced soon",
  },
  "lottery.noCompleted": { es: "No hay sorteos completados", en: "No completed raffles" },
  "lottery.noCompleted.desc": { es: "El historial de sorteos aparecerá aquí", en: "Raffle history will appear here" },
  "lottery.prize": { es: "Premio", en: "Prize" },
  "lottery.ticketsSold": { es: "tickets vendidos", en: "tickets sold" },
  "lottery.winner": { es: "Ganador", en: "Winner" },
  "lottery.winningTicket": { es: "Ticket Ganador", en: "Winning Ticket" },

  // Lottery Card
  "lotteryCard.live": { es: "En Vivo", en: "Live" },
  "lotteryCard.soon": { es: "Próximamente", en: "Coming Soon" },
  "lotteryCard.ticketPrice": { es: "Precio Ticket", en: "Ticket Price" },
  "lotteryCard.participants": { es: "Participantes", en: "Participants" },
  "lotteryCard.ticketsSold": { es: "Tickets vendidos", en: "Tickets sold" },
  "lotteryCard.lastTickets": { es: "Últimos tickets disponibles", en: "Last tickets available" },
  "lotteryCard.timeRemaining": { es: "Tiempo restante", en: "Time remaining" },
  "lotteryCard.startsIn": { es: "Comienza en", en: "Starts in" },
  "lotteryCard.buyTickets": { es: "Comprar Tickets", en: "Buy Tickets" },
  "lotteryCard.viewDetails": { es: "Ver Detalles", en: "View Details" },

  // Login Page
  "login.title": { es: "Iniciar Sesión", en: "Login" },
  "login.subtitle": { es: "Accede a tu cuenta", en: "Access your account" },
  "login.backToHome": { es: "Volver al inicio", en: "Back to home" },
  "login.email": { es: "Email", en: "Email" },
  "login.emailPlaceholder": { es: "tu@email.com", en: "your@email.com" },
  "login.password": { es: "Contraseña", en: "Password" },
  "login.passwordPlaceholder": { es: "••••••••", en: "••••••••" },
  "login.button": { es: "Iniciar Sesión", en: "Login" },
  "login.buttonLoading": { es: "Iniciando sesión...", en: "Logging in..." },
  "login.testAccounts": { es: "Cuentas de prueba:", en: "Test accounts:" },
  "login.admin": { es: "Admin: admin@usdtlottery.com", en: "Admin: admin@usdtlottery.com" },
  "login.user": { es: "Usuario: user@example.com", en: "User: user@example.com" },
  "login.anyPassword": { es: "Contraseña: cualquiera", en: "Password: any" },
  "login.noAccount": { es: "¿No tienes cuenta?", en: "Don't have an account?" },
  "login.registerHere": { es: "Regístrate aquí", en: "Register here" },
  "login.forgotPassword": { es: "¿Olvidaste tu contraseña?", en: "Forgot your password?" },
  "login.forgotPassword.message": {
    es: "Contacta al soporte para restablecer tu contraseña",
    en: "Contact support to reset your password",
  },
  "login.forgotPassword.dialog.desc": {
    es: "Para restablecer tu contraseña, por favor contacta a nuestro equipo de soporte",
    en: "To reset your password, please contact our support team",
  },
  "login.forgotPassword.dialog.email.title": { es: "Envía un Email", en: "Send an Email" },
  "login.forgotPassword.dialog.email.desc": {
    es: "Envía un correo a nuestro equipo de soporte con tu email registrado",
    en: "Send an email to our support team with your registered email",
  },
  "login.forgotPassword.dialog.support.title": { es: "Soporte en Línea", en: "Online Support" },
  "login.forgotPassword.dialog.support.desc": {
    es: "Nuestro equipo responderá en menos de 24 horas para ayudarte a recuperar tu cuenta",
    en: "Our team will respond within 24 hours to help you recover your account",
  },
  "login.forgotPassword.dialog.info.title": { es: "Información Importante:", en: "Important Information:" },
  "login.forgotPassword.dialog.info.desc": {
    es: "Por seguridad, necesitarás verificar tu identidad antes de restablecer tu contraseña. Ten a mano tu email registrado y cualquier información de tu cuenta.",
    en: "For security, you'll need to verify your identity before resetting your password. Have your registered email and any account information ready.",
  },
  "login.forgotPassword.dialog.close": { es: "Entendido", en: "Got it" },
  "login.welcomeBack": { es: "Bienvenido de vuelta", en: "Welcome back" },
  "login.welcomeBack.desc": { es: "Has\u00a0iniciado sesión como {name}", en: "You've logged in as {name}" },
  "login.error": { es: "Error de autenticación", en: "Authentication error" },
  "login.error.desc": { es: "Email o contraseña incorrectos", en: "Incorrect email or password" },
  "login.error.generic": { es: "Ocurrió un error al iniciar sesión", en: "An error occurred while logging in" },
  "login.resetPassword": { es: "Restablecer Contraseña", en: "Reset Password" },
  "login.resetPassword.enterEmail": { es: "Ingresa tu email", en: "Enter your email" },
  "login.resetPassword.enterEmail.desc": {
    es: "Te enviaremos un código de verificación",
    en: "We'll send you a verification code",
  },
  "login.resetPassword.emailPlaceholder": { es: "tu@email.com", en: "your@email.com" },
  "login.resetPassword.sendCode": { es: "Enviar Código", en: "Send Code" },
  "login.resetPassword.verifyCode": { es: "Verificación de Email", en: "Email Verification" },
  "login.resetPassword.verifyCode.desc": {
    es: "Ingresa el código de verificación de 6 dígitos enviado a",
    en: "Enter the 6-digit verification code sent to",
  },
  "login.resetPassword.codePlaceholder": { es: "000000", en: "000000" },
  "login.resetPassword.codeLabel": { es: "Código de Verificación", en: "Verification Code" },
  "login.resetPassword.codeSent": { es: "Código Enviado", en: "Code Sent" },
  "login.resetPassword.submit": { es: "Enviar", en: "Submit" },
  "login.resetPassword.newPassword": { es: "Nueva Contraseña", en: "New Password" },
  "login.resetPassword.newPassword.desc": {
    es: "Ingresa tu nueva contraseña",
    en: "Enter your new password",
  },
  "login.resetPassword.newPasswordPlaceholder": { es: "••••••••", en: "••••••••" },
  "login.resetPassword.confirmPassword": { es: "Confirmar Contraseña", en: "Confirm Password" },
  "login.resetPassword.confirmPasswordPlaceholder": { es: "••••••••", en: "••••••••" },
  "login.resetPassword.resetButton": { es: "Restablecer Contraseña", en: "Reset Password" },
  "login.resetPassword.success": { es: "Contraseña restablecida", en: "Password reset" },
  "login.resetPassword.success.desc": {
    es: "Tu contraseña ha sido restablecida exitosamente",
    en: "Your password has been reset successfully",
  },
  "login.resetPassword.error.invalidEmail": { es: "Email no encontrado", en: "Email not found" },
  "login.resetPassword.error.invalidEmail.desc": {
    es: "No existe una cuenta con este email",
    en: "No account exists with this email",
  },
  "login.resetPassword.error.invalidCode": { es: "Código inválido", en: "Invalid code" },
  "login.resetPassword.error.invalidCode.desc": {
    es: "El código ingresado es incorrecto o ha expirado",
    en: "The code entered is incorrect or has expired",
  },
  "login.resetPassword.error.passwordMismatch": { es: "Las contraseñas no coinciden", en: "Passwords don't match" },
  "login.resetPassword.error.passwordMismatch.desc": {
    es: "Las contraseñas ingresadas no coinciden",
    en: "The passwords entered don't match",
  },
  "login.resetPassword.codeSentSuccess": { es: "Código enviado", en: "Code sent" },
  "login.resetPassword.codeSentSuccess.desc": {
    es: "Revisa tu email para el código de verificación",
    en: "Check your email for the verification code",
  },
  "login.resetPassword.demoCode": { es: "Código de demostración:", en: "Demo code:" },
  "login.resetPassword.back": { es: "Volver", en: "Back" },

  // Register Page
  "register.title": { es: "Crear Cuenta", en: "Create Account" },
  "register.subtitle": { es: "Únete y recibe 5 USDT gratis", en: "Join and get 5 USDT free" },
  "register.backToHome": { es: "Volver al inicio", en: "Back to home" },
  "register.name": { es: "Nombre", en: "Name" },
  "register.namePlaceholder": { es: "Tu nombre", en: "Your name" },
  "register.email": { es: "Email", en: "Email" },
  "register.emailPlaceholder": { es: "tu@email.com", en: "your@email.com" },
  "register.password": { es: "Contraseña", en: "Password" },
  "register.passwordPlaceholder": { es: "••••••••", en: "••••••••" },
  "register.button": { es: "Regístrate para reclamar $5", en: "Register to claim $5" },
  "register.buttonLoading": { es: "Creando cuenta...", en: "Creating account..." },
  "register.haveAccount": { es: "¿Ya tienes cuenta?", en: "Already have an account?" },
  "register.loginHere": { es: "Inicia sesión aquí", en: "Login here" },
  "register.success": { es: "Cuenta creada exitosamente", en: "Account created successfully" },
  "register.success.desc": {
    es: "Bienvenido {name}! Has recibido 5 USDT de bono inicial.",
    en: "Welcome {name}! You've received 5 USDT as initial bonus.",
  },
  "register.error": { es: "Error", en: "Error" },
  "register.error.desc": { es: "Ocurrió un error al crear la cuenta", en: "An error occurred while creating account" },
  "register.acceptTerms": {
    es: "He leído y acepto los",
    en: "I have read and accept the",
  },
  "register.termsOfUse": { es: "Términos de Uso", en: "Terms of Use" },
  "register.mustAcceptTerms": {
    es: "Debes aceptar los términos de uso",
    en: "You must accept the terms of use",
  },
  "register.password.requirements": { es: "Requisitos de contraseña:", en: "Password requirements:" },
  "register.password.length": { es: "10-128 caracteres", en: "10-128 characters" },
  "register.password.letter": { es: "Al menos una letra", en: "At least one letter" },
  "register.password.number": { es: "Al menos 1 número", en: "At least 1 number" },
  "register.password.special": { es: "Al menos un carácter especial", en: "At least one special character" },
  "register.password.weak": { es: "Contraseña no cumple los requisitos", en: "Password does not meet requirements" },
  "register.referralCode": { es: "Código de Referido (Opcional)", en: "Referral Code (Optional)" },
  "register.referralCodePlaceholder": { es: "Ingresa el código de referido", en: "Enter referral code" },
  "register.referralCode.invalid": { es: "Código de referido inválido", en: "Invalid referral code" },
  "register.referralCode.valid": { es: "Código válido", en: "Valid code" },

  // Settings Page
  "settings.title": { es: "Configuración", en: "Settings" },
  "settings.subtitle": { es: "Gestiona tu cuenta y preferencias", en: "Manage your account and preferences" },
  "settings.account.title": { es: "Información de la Cuenta", en: "Account Information" },
  "settings.account.subtitle": { es: "Detalles de tu cuenta", en: "Your account details" },
  "settings.account.userId": { es: "ID de Usuario", en: "User ID" },
  "settings.account.role": { es: "Rol", en: "Role" },
  "settings.account.memberSince": { es: "Miembro desde", en: "Member since" },
  "settings.account.status": { es: "Estado", en: "Status" },
  "settings.profile.title": { es: "Información Personal", en: "Personal Information" },
  "settings.profile.subtitle": { es: "Actualiza tus datos personales", en: "Update your personal information" },
  "settings.profile.name": { es: "Nombre", en: "Name" },
  "settings.profile.email": { es: "Email", en: "Email" },
  "settings.profile.save": { es: "Guardar Cambios", en: "Save Changes" },
  "settings.profile.saving": { es: "Guardando...", en: "Saving..." },
  "settings.profile.saved": { es: "Cambios guardados", en: "Changes saved" },
  "settings.profile.saved.desc": { es: "Tu perfil ha sido actualizado", en: "Your profile has been updated" },
  "settings.profile.error": { es: "No se pudieron guardar los cambios", en: "Could not save changes" },
  "settings.security.title": { es: "Seguridad", en: "Security" },
  "settings.security.subtitle": { es: "Protege tu cuenta", en: "Protect your account" },
  "settings.security.currentPassword": { es: "Contraseña Actual", en: "Current Password" },
  "settings.security.newPassword": { es: "Nueva Contraseña", en: "New Password" },
  "settings.security.confirmPassword": { es: "Confirmar Contraseña", en: "Confirm Password" },
  "settings.security.changePassword": { es: "Cambiar Contraseña", en: "Change Password" },
  "settings.security.changing": { es: "Cambiando...", en: "Changing..." },
  "settings.security.passwordChanged": { es: "Contraseña cambiada", en: "Password changed" },
  "settings.security.passwordChanged.desc": {
    es: "Tu contraseña ha sido actualizada",
    en: "Your password has been updated",
  },
  "settings.security.error.currentPassword": { es: "Ingresa tu contraseña actual", en: "Enter your current password" },
  "settings.security.error.generic": { es: "No se pudo cambiar la contraseña", en: "Could not change password" },
  "settings.language.title": { es: "Idioma", en: "Language" },
  "settings.language.subtitle": { es: "Selecciona tu idioma preferido", en: "Select your preferred language" },
  "settings.language.select": { es: "Idioma de la plataforma", en: "Platform language" },
  "settings.notifications.title": { es: "Notificaciones", en: "Notifications" },
  "settings.notifications.subtitle": {
    es: "Configura tus preferencias de notificación",
    en: "Configure your notification preferences",
  },
  "settings.notifications.raffles": { es: "Notificaciones de sorteos", en: "Raffle notifications" },
  "settings.notifications.raffles.desc": {
    es: "Recibe alertas cuando ganes un sorteo",
    en: "Receive alerts when you win a raffle",
  },
  "settings.notifications.deposits": { es: "Notificaciones de depósitos", en: "Deposit notifications" },
  "settings.notifications.deposits.desc": {
    es: "Confirma cuando recibas fondos",
    en: "Confirm when you receive funds",
  },
  "settings.notifications.withdrawals": { es: "Notificaciones de retiros", en: "Withdrawal notifications" },
  "settings.notifications.withdrawals.desc": {
    es: "Confirma cuando retires fondos",
    en: "Confirm when you withdraw funds",
  },
  "settings.notifications.newsletter": { es: "Boletín informativo", en: "Newsletter" },
  "settings.notifications.newsletter.desc": {
    es: "Recibe noticias y actualizaciones",
    en: "Receive news and updates",
  },
  "settings.notifications.enabled": { es: "Activado", en: "Enabled" },
  "settings.notifications.disabled": { es: "Desactivado", en: "Disabled" },
  "settings.notifications.updated": { es: "Preferencias actualizadas", en: "Preferences updated" },
  "settings.notifications.updated.desc": {
    es: "Tus preferencias han sido guardadas",
    en: "Your preferences have been saved",
  },
  "settings.danger.title": { es: "Zona de Peligro", en: "Danger Zone" },
  "settings.danger.subtitle": { es: "Acciones irreversibles", en: "Irreversible actions" },
  "settings.danger.deleteAccount": { es: "Eliminar Cuenta", en: "Delete Account" },
  "settings.danger.deleteAccount.desc": {
    es: "Una vez eliminada tu cuenta, no hay vuelta atrás. Por favor, asegúrate de haber retirado todos tus fondos antes de continuar.",
    en: "Once you delete your account, there is no going back. Please be certain you have withdrawn all your funds before proceeding.",
  },

  // History Page
  "history.title": { es: "Historial de Transacciones", en: "Transaction History" },
  "history.subtitle": {
    es: "Revisa todas tus transacciones y actividad",
    en: "Review all your transactions and activity",
  },
  "history.totalDeposited": { es: "Total Depositado", en: "Total Deposited" },
  "history.totalWithdrawn": { es: "Total Retirado", en: "Total Withdrawn" },
  "history.spentOnTickets": { es: "Gastado en Tickets", en: "Spent on Tickets" },
  "history.prizesWon": { es: "Premios Ganados", en: "Prizes Won" },
  "history.filterBy": { es: "Filtrar por:", en: "Filter by:" },
  "history.filter.all": { es: "Todas", en: "All" },
  "history.filter.deposits": { es: "Depósitos", en: "Deposits" },
  "history.filter.withdrawals": { es: "Retiros", en: "Withdrawals" },
  "history.filter.tickets": { es: "Tickets", en: "Tickets" },
  "history.filter.prizes": { es: "Premios", en: "Prizes" },
  "history.transactions": { es: "Transacciones", en: "Transactions" },
  "history.status.completed": { es: "Completado", en: "Completed" },
  "history.status.pending": { es: "Pendiente", en: "Pending" },
  "history.status.failed": { es: "Fallido", en: "Failed" },
  "history.noTransactions": { es: "No hay transacciones para mostrar", en: "No transactions to show" },
  "history.ticket": { es: "Ticket", en: "Ticket" },

  // Results Page
  "results.title": { es: "Resultados de Sorteos", en: "Raffle Results" },
  "results.subtitle": { es: "Historial completo de ganadores", en: "Complete winner history" },
  "results.yourWins": { es: "Tus Victorias", en: "Your Wins" },
  "results.totalWon": { es: "Total ganado", en: "Total won" },
  "results.allResults": { es: "Todos los Resultados", en: "All Results" },
  "results.filter.all": { es: "Todos", en: "All" },
  "results.filter.won": { es: "Ganados", en: "Won" },
  "results.youWon": { es: "Ganaste", en: "You Won" },
  "results.prize": { es: "Premio", en: "Prize" },
  "results.winningTicket": { es: "Ticket Ganador", en: "Winning Ticket" },
  "results.participants": { es: "Participantes", en: "Participants" },
  "results.totalTickets": { es: "Total Tickets", en: "Total Tickets" },
  "results.winner": { es: "Ganador", en: "Winner" },
  "results.prizeReceived": { es: "Premio Recibido", en: "Prize Received" },
  "results.noResults": { es: "No hay resultados disponibles", en: "No results available" },
  "results.noResults.desc": {
    es: "Los resultados aparecerán aquí cuando haya sorteos completados",
    en: "Results will appear here when there are completed raffles",
  },

  // Admin Dashboard
  "admin.dashboard.title": { es: "Panel de Administración", en: "Admin Dashboard" },
  "admin.dashboard.subtitle": {
    es: "Gestiona sorteos, usuarios y configuraciones",
    en: "Manage raffles, users and settings",
  },
  "admin.dashboard.createRaffle": { es: "Crear Sorteo", en: "Create Raffle" },
  "admin.dashboard.totalUsers": { es: "Total Usuarios", en: "Total Users" },
  "admin.dashboard.activeRaffles": { es: "Sorteos Activos", en: "Active Raffles" },
  "admin.dashboard.live": { es: "en vivo", en: "live" },
  "admin.dashboard.totalRevenue": { es: "Ingresos Totales", en: "Total Revenue" },
  "admin.dashboard.ticketsSold": { es: "Tickets Vendidos", en: "Tickets Sold" },
  "admin.dashboard.total": { es: "Total", en: "Total" },
  "admin.dashboard.quickActions": { es: "Acciones Rápidas", en: "Quick Actions" },
  "admin.dashboard.manageRaffles": { es: "Gestionar Sorteos", en: "Manage Raffles" },
  "admin.dashboard.manageRaffles.desc": {
    es: "Crear, editar y eliminar sorteos",
    en: "Create, edit and delete raffles",
  },
  "admin.dashboard.manageUsers": { es: "Gestionar Usuarios", en: "Manage Users" },
  "admin.dashboard.manageUsers.desc": { es: "Ver y administrar usuarios", en: "View and manage users" },
  "admin.dashboard.configuration": { es: "Configuración", en: "Configuration" },
  "admin.dashboard.configuration.desc": { es: "Ajustes de la plataforma", en: "Platform settings" },
  "admin.dashboard.recentRaffles": { es: "Sorteos Recientes", en: "Recent Raffles" },
  "admin.dashboard.viewAll": { es: "Ver todos", en: "View all" },
  "admin.dashboard.ticketsSoldOf": { es: "tickets vendidos", en: "tickets sold" },
  "admin.dashboard.active": { es: "Activo", en: "Active" },
  "admin.dashboard.upcoming": { es: "Próximo", en: "Upcoming" },
  "admin.dashboard.completed": { es: "Completado", en: "Completed" },

  // Admin Results
  "admin.results.title": { es: "Resultados y Estadísticas", en: "Results and Statistics" },
  "admin.results.subtitle": {
    es: "Historial completo de sorteos completados",
    en: "Complete history of completed raffles",
  },
  "admin.results.completedRaffles": { es: "Sorteos Completados", en: "Completed Raffles" },
  "admin.results.prizesDistributed": { es: "Premios Distribuidos", en: "Prizes Distributed" },
  "admin.results.totalParticipants": { es: "Total Participantes", en: "Total Participants" },
  "admin.results.ticketsSold": { es: "Tickets Vendidos", en: "Tickets Sold" },
  "admin.results.history": { es: "Historial de Resultados", en: "Results History" },
  "admin.results.winner": { es: "Ganador", en: "Winner" },
  "admin.results.ticket": { es: "Ticket", en: "Ticket" },
  "admin.results.participants": { es: "participantes", en: "participants" },
  "admin.results.tickets": { es: "tickets", en: "tickets" },
  "admin.results.noResults": { es: "No hay resultados disponibles", en: "No results available" },

  // Admin Lotteries
  "admin.lotteries.title": { es: "Gestión de Sorteos", en: "Raffle Management" },
  "admin.lotteries.subtitle": {
    es: "Administra todos los sorteos de la plataforma",
    en: "Manage all platform raffles",
  },
  "admin.lotteries.createRaffle": { es: "Crear Sorteo", en: "Create Raffle" },
  "admin.lotteries.active": { es: "Activos", en: "Active" },
  "admin.lotteries.upcoming": { es: "Próximos", en: "Upcoming" },
  "admin.lotteries.completed": { es: "Completados", en: "Completed" },
  "admin.lotteries.prize": { es: "Premio", en: "Prize" },
  "admin.lotteries.price": { es: "Precio", en: "Price" },
  "admin.lotteries.tickets": { es: "Tickets", en: "Tickets" },
  "admin.lotteries.noActive": { es: "No hay sorteos activos", en: "No active raffles" },
  "admin.lotteries.noUpcoming": { es: "No hay sorteos próximos", en: "No upcoming raffles" },
  "admin.lotteries.noCompleted": { es: "No hay sorteos completados", en: "No completed raffles" },

  // Admin Create Lottery
  "admin.createLottery.title": { es: "Crear Nuevo Sorteo", en: "Create New Raffle" },
  "admin.createLottery.subtitle": { es: "Configura los detalles del sorteo", en: "Configure raffle details" },
  "admin.createLottery.backToRaffles": { es: "Volver a sorteos", en: "Back to raffles" },
  "admin.createLottery.raffleTitle": { es: "Título del Sorteo", en: "Raffle Title" },
  "admin.createLottery.raffleTitlePlaceholder": { es: "Ej: Sorteo Mega Premium", en: "Ex: Mega Premium Raffle" },
  "admin.createLottery.prizeAmount": { es: "Premio (USDT)", en: "Prize (USDT)" },
  "admin.createLottery.ticketPrice": { es: "Precio por Ticket (USDT)", en: "Price per Ticket (USDT)" },
  "admin.createLottery.maxTickets": { es: "Máximo de Tickets", en: "Maximum Tickets" },
  "admin.createLottery.duration": { es: "Duración (minutos)", en: "Duration (minutes)" },
  "admin.createLottery.summary": { es: "Resumen", en: "Summary" },
  "admin.createLottery.totalPrize": { es: "Premio total", en: "Total prize" },
  "admin.createLottery.potentialRevenue": { es: "Ingresos potenciales", en: "Potential revenue" },
  "admin.createLottery.durationLabel": { es: "Duración", en: "Duration" },
  "admin.createLottery.minutes": { es: "minutos", en: "minutes" },
  "admin.createLottery.create": { es: "Crear Sorteo", en: "Create Raffle" },
  "admin.createLottery.creating": { es: "Creando...", en: "Creating..." },
  "admin.createLottery.cancel": { es: "Cancelar", en: "Cancel" },
  "admin.createLottery.success": { es: "Sorteo creado", en: "Raffle created" },
  "admin.createLottery.success.desc": {
    es: "El sorteo ha sido creado exitosamente",
    en: "The raffle has been created successfully",
  },
  "admin.createLottery.error": { es: "Error", en: "Error" },
  "admin.createLottery.error.desc": {
    es: "Ocurrió un error al crear el sorteo",
    en: "An error occurred while creating the raffle",
  },

  // Admin Users
  "admin.users.title": { es: "Gestión de Usuarios", en: "User Management" },
  "admin.users.subtitle": { es: "Administra todos los usuarios de la plataforma", en: "Manage all platform users" },
  "admin.users.totalUsers": { es: "Total Usuarios", en: "Total Users" },
  "admin.users.administrators": { es: "Administradores", en: "Administrators" },
  "admin.users.totalBalance": { es: "Balance Total", en: "Total Balance" },
  "admin.users.search": { es: "Buscar por nombre o email...", en: "Search by name or email..." },
  "admin.users.admin": { es: "Admin", en: "Admin" },
  "admin.users.viewDetails": { es: "Ver Detalles", en: "View Details" },

  // Admin Settings
  "admin.settings.title": { es: "Configuración de la Plataforma", en: "Platform Configuration" },
  "admin.settings.description": {
    es: "Ajusta los parámetros globales del sistema",
    en: "Adjust global system parameters",
  },
  "admin.settings.subtitle": {
    es: "Ajusta los parámetros globales del sistema",
    en: "Adjust global system parameters",
  },
  "admin.settings.general.title": { es: "Configuración General", en: "General Configuration" },
  "admin.settings.general.subtitle": { es: "Parámetros básicos de la plataforma", en: "Basic platform parameters" },
  "admin.settings.platformName": { es: "Nombre de la Plataforma", en: "Platform Name" },
  "admin.settings.supportEmail": { es: "Email de Soporte", en: "Support Email" },
  "admin.settings.raffle.title": { es: "Configuración de Sorteos", en: "Raffle Configuration" },
  "admin.settings.raffle.subtitle": {
    es: "Parámetros por defecto para nuevos sorteos",
    en: "Default parameters for new raffles",
  },
  "admin.settings.defaultDuration": { es: "Duración por Defecto (minutos)", en: "Default Duration (minutes)" },
  "admin.settings.minTicketPrice": { es: "Precio Mínimo de Ticket (USDT)", en: "Minimum Ticket Price (USDT)" },
  "admin.settings.maxTicketsPerUser": { es: "Máximo Tickets por Usuario", en: "Maximum Tickets per User" },
  "admin.settings.autoStart": { es: "Inicio Automático de Sorteos", en: "Automatic Raffle Start" },
  "admin.settings.enabled": { es: "Activado", en: "Enabled" },
  "admin.settings.financial.title": { es: "Configuración Financiera", en: "Financial Configuration" },
  "admin.settings.financial.subtitle": {
    es: "Comisiones y límites de transacciones",
    en: "Fees and transaction limits",
  },
  "admin.settings.platformFee": { es: "Comisión de Plataforma (%)", en: "Platform Fee (%)" },
  "admin.settings.withdrawalFee": { es: "Comisión de Retiro (USDT)", en: "Withdrawal Fee (USDT)" },
  "admin.settings.minDeposit": { es: "Depósito Mínimo (USDT)", en: "Minimum Deposit (USDT)" },
  "admin.settings.minWithdrawal": { es: "Retiro Mínimo (USDT)", en: "Minimum Withdrawal (USDT)" },
  "admin.settings.security.title": { es: "Seguridad", en: "Security" },
  "admin.settings.security.subtitle": {
    es: "Configuración de seguridad y verificación",
    en: "Security and verification settings",
  },
  "admin.settings.emailVerification": { es: "Verificación de Email", en: "Email Verification" },
  "admin.settings.emailVerification.desc": {
    es: "Requiere verificación de email para nuevos usuarios",
    en: "Requires email verification for new users",
  },
  "admin.settings.twoFactor": { es: "Autenticación de Dos Factores", en: "Two-Factor Authentication" },
  "admin.settings.twoFactor.desc": {
    es: "2FA para retiros y cambios de configuración",
    en: "2FA for withdrawals and configuration changes",
  },
  "admin.settings.loginLimit": { es: "Límite de Intentos de Login", en: "Login Attempt Limit" },
  "admin.settings.loginLimit.desc": {
    es: "Bloqueo temporal después de 5 intentos fallidos",
    en: "Temporary lockout after 5 failed attempts",
  },
  "admin.settings.disabled": { es: "Desactivado", en: "Disabled" },
  "admin.settings.saveChanges": { es: "Guardar Cambios", en: "Save Changes" },
  "admin.settings.reset": { es: "Restablecer", en: "Reset" },

  // Privacy Policy translations
  "privacy.title": { es: "Política de Privacidad", en: "Privacy Policy" },
  "privacy.lastUpdated": { es: "Última actualización: Enero 2025", en: "Last updated: January 2025" },
  "privacy.intro.title": { es: "Introducción", en: "Introduction" },
  "privacy.intro.content": {
    es: "En Raffle USDT, nos comprometemos a proteger tu privacidad y datos personales. Esta política describe cómo recopilamos, usamos y protegemos tu información cuando utilizas nuestra plataforma de sorteos.",
    en: "At Raffle USDT, we are committed to protecting your privacy and personal data. This policy describes how we collect, use, and protect your information when you use our raffle platform.",
  },
  "privacy.collection.title": { es: "Información que Recopilamos", en: "Information We Collect" },
  "privacy.collection.personal": { es: "Información Personal", en: "Personal Information" },
  "privacy.collection.personal.content": {
    es: "Recopilamos tu nombre, dirección de correo electrónico y contraseña cuando creas una cuenta. Esta información es necesaria para identificarte y proteger tu cuenta.",
    en: "We collect your name, email address, and password when you create an account. This information is necessary to identify you and protect your account.",
  },
  "privacy.collection.wallet": { es: "Información de Billetera", en: "Wallet Information" },
  "privacy.collection.wallet.content": {
    es: "Almacenamos tu dirección de billetera crypto y el historial de transacciones para procesar depósitos, retiros y pagos de premios de manera segura.",
    en: "We store your crypto wallet address and transaction history to securely process deposits, withdrawals, and prize payments.",
  },
  "privacy.collection.activity": { es: "Actividad en la Plataforma", en: "Platform Activity" },
  "privacy.collection.activity.content": {
    es: "Registramos tu participación en sorteos, compra de tickets y premios ganados para mantener un historial transparente y verificable de todas las actividades.",
    en: "We record your raffle participation, ticket purchases, and prizes won to maintain a transparent and verifiable history of all activities.",
  },
  "privacy.use.title": { es: "Cómo Usamos tu Información", en: "How We Use Your Information" },
  "privacy.use.content": {
    es: "Utilizamos tu información para: operar y mantener la plataforma, procesar transacciones y pagos, verificar tu identidad, prevenir fraudes, enviarte notificaciones importantes sobre sorteos y premios, y mejorar nuestros servicios.",
    en: "We use your information to: operate and maintain the platform, process transactions and payments, verify your identity, prevent fraud, send you important notifications about raffles and prizes, and improve our services.",
  },
  "privacy.security.title": { es: "Seguridad de Datos", en: "Data Security" },
  "privacy.security.content": {
    es: "Implementamos medidas de seguridad de nivel empresarial incluyendo encriptación de datos, autenticación segura, monitoreo continuo de seguridad y copias de seguridad regulares. Tus contraseñas están encriptadas y nunca se almacenan en texto plano.",
    en: "We implement enterprise-level security measures including data encryption, secure authentication, continuous security monitoring, and regular backups. Your passwords are encrypted and never stored in plain text.",
  },
  "privacy.sharing.title": { es: "Compartir Información", en: "Information Sharing" },
  "privacy.sharing.content": {
    es: "No vendemos ni compartimos tu información personal con terceros. Solo compartimos datos cuando es legalmente requerido o necesario para procesar transacciones blockchain.",
    en: "We do not sell or share your personal information with third parties. We only share data when legally required or necessary to process blockchain transactions.",
  },
  "privacy.rights.title": { es: "Tus Derechos", en: "Your Rights" },
  "privacy.rights.content": {
    es: "Tienes derecho a: acceder a tu información personal, solicitar corrección de datos incorrectos, solicitar eliminación de tu cuenta, exportar tus datos, y optar por no recibir comunicaciones de marketing.",
    en: "You have the right to: access your personal information, request correction of incorrect data, request deletion of your account, export your data, and opt out of marketing communications.",
  },
  "privacy.contact.title": { es: "Contacto", en: "Contact" },
  "privacy.contact.content": {
    es: "Si tienes preguntas sobre esta política de privacidad, contáctanos en privacy@raffleusdt.com",
    en: "If you have questions about this privacy policy, contact us at privacy@raffleusdt.com",
  },

  // Terms of Use translations
  "terms.title": { es: "Términos de Uso", en: "Terms of Use" },
  "terms.lastUpdated": { es: "Última actualización: Enero 2025", en: "Last updated: January 2025" },
  "terms.acceptance.title": { es: "Aceptación de Términos", en: "Acceptance of Terms" },
  "terms.acceptance.content": {
    es: "Al acceder y usar Raffle USDT, aceptas estar sujeto a estos términos de uso. Si no estás de acuerdo con alguna parte de estos términos, no debes usar nuestra plataforma.",
    en: "By accessing and using Raffle USDT, you agree to be bound by these terms of use. If you disagree with any part of these terms, you should not use our platform.",
  },
  "terms.eligibility.title": { es: "Elegibilidad", en: "Eligibility" },
  "terms.eligibility.content": {
    es: "Debes tener al menos 18 años de edad para usar esta plataforma. Al registrarte, confirmas que tienes la edad legal y la capacidad para aceptar estos términos. El uso de la plataforma puede estar restringido en ciertas jurisdicciones.",
    en: "You must be at least 18 years old to use this platform. By registering, you confirm that you are of legal age and have the capacity to accept these terms. Use of the platform may be restricted in certain jurisdictions.",
  },
  "terms.restrictions.title": { es: "Restricciones Geográficas", en: "Geographic Restrictions" },
  "terms.restrictions.content": {
    es: "Esta plataforma NO está disponible para residentes de Estados Unidos. Al usar nuestros servicios, confirmas que no eres residente de Estados Unidos ni estás accediendo a la plataforma desde territorio estadounidense. Nos reservamos el derecho de suspender cuentas que violen esta restricción.",
    en: "This platform is NOT available for United States residents. By using our services, you confirm that you are not a US resident and are not accessing the platform from US territory. We reserve the right to suspend accounts that violate this restriction.",
  },
  "terms.account.title": { es: "Cuenta de Usuario", en: "User Account" },
  "terms.account.content": {
    es: "Eres responsable de mantener la confidencialidad de tu cuenta y contraseña. Debes notificarnos inmediatamente sobre cualquier uso no autorizado de tu cuenta. No puedes transferir tu cuenta a otra persona sin nuestro consentimiento previo.",
    en: "You are responsible for maintaining the confidentiality of your account and password. You must notify us immediately of any unauthorized use of your account. You cannot transfer your account to another person without our prior consent.",
  },
  "terms.raffles.title": { es: "Sorteos y Tickets", en: "Raffles and Tickets" },
  "terms.raffles.content": {
    es: "Los sorteos se realizan automáticamente según el horario publicado. Los tickets comprados no son reembolsables. Los ganadores se seleccionan aleatoriamente mediante un sistema verificable. Los premios se depositan automáticamente en la billetera del ganador. Nos reservamos el derecho de cancelar sorteos en circunstancias excepcionales.",
    en: "Raffles are conducted automatically according to the published schedule. Purchased tickets are non-refundable. Winners are selected randomly through a verifiable system. Prizes are automatically deposited into the winner's wallet. We reserve the right to cancel raffles under exceptional circumstances.",
  },
  "terms.payments.title": { es: "Pagos y Transacciones", en: "Payments and Transactions" },
  "terms.payments.content": {
    es: "Todas las transacciones se realizan en USDT (Tether). Los depósitos se procesan automáticamente tras confirmación blockchain. Los retiros están sujetos a verificación de seguridad. Aplicamos comisiones de red estándar para retiros. Eres responsable de proporcionar direcciones de billetera correctas.",
    en: "All transactions are conducted in USDT (Tether). Deposits are processed automatically after blockchain confirmation. Withdrawals are subject to security verification. We apply standard network fees for withdrawals. You are responsible for providing correct wallet addresses.",
  },
  "terms.prohibited.title": { es: "Conducta Prohibida", en: "Prohibited Conduct" },
  "terms.prohibited.content": {
    es: "Está prohibido: usar la plataforma para actividades ilegales, intentar manipular sorteos o resultados, crear múltiples cuentas para obtener ventajas injustas, usar bots o automatización no autorizada, y realizar actividades fraudulentas o de lavado de dinero.",
    en: "It is prohibited to: use the platform for illegal activities, attempt to manipulate raffles or results, create multiple accounts for unfair advantages, use unauthorized bots or automation, and engage in fraudulent or money laundering activities.",
  },
  "terms.liability.title": { es: "Limitación de Responsabilidad", en: "Limitation of Liability" },
  "terms.liability.content": {
    es: "Raffle USDT se proporciona 'tal cual' sin garantías de ningún tipo. No somos responsables por pérdidas indirectas, incidentales o consecuentes. Nuestra responsabilidad máxima está limitada al monto de tu balance en la plataforma.",
    en: "Raffle USDT is provided 'as is' without warranties of any kind. We are not liable for indirect, incidental, or consequential losses. Our maximum liability is limited to the amount of your balance on the platform.",
  },
  "terms.termination.title": { es: "Terminación", en: "Termination" },
  "terms.termination.content": {
    es: "Podemos suspender o terminar tu cuenta si violas estos términos. Puedes cerrar tu cuenta en cualquier momento desde la configuración. Al cerrar tu cuenta, debes retirar todos los fondos restantes.",
    en: "We may suspend or terminate your account if you violate these terms. You can close your account at any time from settings. Upon closing your account, you must withdraw all remaining funds.",
  },
  "terms.changes.title": { es: "Cambios a los Términos", en: "Changes to Terms" },
  "terms.changes.content": {
    es: "Nos reservamos el derecho de modificar estos términos en cualquier momento. Te notificaremos sobre cambios significativos por email. El uso continuado de la plataforma después de cambios constituye aceptación de los nuevos términos.",
    en: "We reserve the right to modify these terms at any time. We will notify you of significant changes by email. Continued use of the platform after changes constitutes acceptance of the new terms.",
  },
  "terms.contact.title": { es: "Contacto", en: "Contact" },
  "terms.contact.content": {
    es: "Para preguntas sobre estos términos, contáctanos en legal@raffleusdt.com",
    en: "For questions about these terms, contact us at legal@raffleusdt.com",
  },

  // Notifications
  "notifications.title": { es: "Notificaciones", en: "Notifications" },
  "notifications.markAllRead": { es: "Marcar todas como leídas", en: "Mark all as read" },
  "notifications.noNotifications": { es: "No hay notificaciones", en: "No notifications" },
  "notifications.noNotifications.desc": {
    es: "Te notificaremos cuando haya novedades",
    en: "We'll notify you when there's news",
  },
  "notifications.viewAll": { es: "Ver todas", en: "View all" },
  "notifications.type.prize": { es: "Premio", en: "Prize" },
  "notifications.type.lottery_end": { es: "Sorteo finalizado", en: "Raffle ended" },
  "notifications.type.deposit": { es: "Depósito", en: "Deposit" },
  "notifications.type.withdrawal": { es: "Retiro", en: "Withdrawal" },
  "notifications.type.info": { es: "Información", en: "Information" },

  // Email Verification
  "verification.title": { es: "Verificación de Email", en: "Email Verification" },
  "verification.subtitle": {
    es: "Ingresa el código de verificación de 6 dígitos enviado al correo electrónico {email}, válido durante 15 minutos.",
    en: "Enter the 6-digit verification code sent to {email}, valid for 15 minutes.",
  },
  "verification.confirm": { es: "Confirmar", en: "Confirm" },
  "verification.resend": { es: "Obtener código de nuevo después de {seconds}s", en: "Get code again after {seconds}s" },
  "verification.resendNow": { es: "Reenviar código", en: "Resend code" },
  "verification.notReceived": {
    es: "¿No ha recibido el código de verificación?",
    en: "Haven't received the verification code?",
  },
  "verification.success": { es: "Email verificado", en: "Email verified" },
  "verification.success.desc": {
    es: "Tu email ha sido verificado exitosamente",
    en: "Your email has been successfully verified",
  },
  "verification.error": { es: "Código inválido", en: "Invalid code" },
  "verification.error.desc": {
    es: "El código ingresado es incorrecto o ha expirado",
    en: "The code entered is incorrect or has expired",
  },
  "verification.codeSent": { es: "Código enviado", en: "Code sent" },
  "verification.codeSent.desc": {
    es: "Se ha enviado un nuevo código a tu email",
    en: "A new code has been sent to your email",
  },

  // Tasks Page
  "tasks.title": { es: "Tareas", en: "Tasks" },
  "tasks.subtitle": { es: "Completa tareas para desbloquear recompensas", en: "Complete tasks to unlock rewards" },
  "tasks.registrationBonus.title": { es: "Bono de Registro", en: "Registration Bonus" },
  "tasks.registrationBonus.amount": { es: "5 USDT", en: "5 USDT" },
  "tasks.registrationBonus.locked": { es: "Bloqueado", en: "Locked" },
  "tasks.registrationBonus.unlocked": { es: "Desbloqueado", en: "Unlocked" },
  "tasks.registrationBonus.requirement": {
    es: "Para desbloquear los 5 USDT de bono de registro, tu primer depósito debe ser de 100 USDT o más",
    en: "To unlock the 5 USDT registration bonus, your first deposit must be 100 USDT or more",
  },
  "tasks.registrationBonus.conditions.title": { es: "Condiciones:", en: "Conditions:" },
  "tasks.registrationBonus.conditions.1": {
    es: "Tu primer depósito debe ser de 100 USDT o más",
    en: "Your first deposit must be 100 USDT or more",
  },
  "tasks.registrationBonus.conditions.2": {
    es: "Si tu primer depósito es menor a 100 USDT, no recibirás el bono",
    en: "If your first deposit is less than 100 USDT, you will not receive the bonus",
  },
  "tasks.registrationBonus.conditions.3": {
    es: "Depósitos posteriores no califican para el bono",
    en: "Subsequent deposits do not qualify for the bonus",
  },
  "tasks.registrationBonus.conditions.4": {
    es: "El bono se acreditará automáticamente después del primer depósito válido",
    en: "The bonus will be credited automatically after the first valid deposit",
  },
  "tasks.registrationBonus.conditions.5": {
    es: "El bono puede ser usado para comprar tickets de sorteos",
    en: "The bonus can be used to buy raffle tickets",
  },
  "tasks.registrationBonus.conditions.6": {
    es: "Esta oferta es válida solo para nuevos usuarios",
    en: "This offer is valid only for new users",
  },
  "tasks.registrationBonus.conditions.7": {
    es: "El bono no es acumulable con otras promociones",
    en: "The bonus is not cumulative with other promotions",
  },
  "tasks.depositNow": { es: "Depositar Ahora", en: "Deposit Now" },
  "tasks.progress": { es: "Progreso", en: "Progress" },
  "tasks.claim": { es: "Reclamar Recompensa", en: "Claim Reward" },
  "tasks.claimed": { es: "Reclamada", en: "Claimed" },
  "tasks.expired": { es: "Caducada", en: "Expired" },
  "tasks.active": { es: "Activa", en: "Active" },
  "tasks.completed": { es: "Completada", en: "Completed" },
  "tasks.history": { es: "Historial de Tareas", en: "Task History" },
  "tasks.filter.active": { es: "Activas", en: "Active" },
  "tasks.filter.claimed": { es: "Reclamadas", en: "Claimed" },
  "tasks.filter.expired": { es: "Caducadas", en: "Expired" },
  "tasks.expiresIn": { es: "Expira en", en: "Expires in" },
  "tasks.claimSuccess": { es: "Recompensa reclamada", en: "Reward claimed" },
  "tasks.claimSuccess.desc": {
    es: "Has recibido {amount} USDT en tu billetera",
    en: "You've received {amount} USDT in your wallet",
  },
  "tasks.claimError": { es: "Error al reclamar", en: "Claim error" },
  "tasks.claimError.desc": {
    es: "No se pudo reclamar la recompensa",
    en: "Could not claim reward",
  },
  "tasks.noTasks": { es: "No hay tareas disponibles", en: "No tasks available" },
  "tasks.noHistory": { es: "No hay historial de tareas", en: "No task history" },
  "tasks.register": { es: "Registrarse", en: "Register" },
  "tasks.enrolled": { es: "Registrado", en: "Registered" },
  "tasks.goToDeposit": { es: "Ir a Depósitos", en: "Go to Deposits" },
  "tasks.goToLottery": { es: "Ir a Sorteos", en: "Go to Lottery" },
  "tasks.enrollSuccess": { es: "Inscripción exitosa", en: "Enrollment successful" },
  "tasks.enrollSuccess.desc": {
    es: "Te has inscrito en la tarea exitosamente",
    en: "You've successfully enrolled in the task",
  },
  "tasks.enrollError": { es: "Error de inscripción", en: "Enrollment error" },
  "tasks.timeRemaining": { es: "Tiempo restante", en: "Time remaining" },

  // Admin Tasks
  "admin.tasks.title": { es: "Gestión de Tareas", en: "Task Management" },
  "admin.tasks.subtitle": {
    es: "Administra las tareas y bonos de la plataforma",
    en: "Manage platform tasks and bonuses",
  },
  "admin.tasks.createTask": { es: "Crear Tarea", en: "Create Task" },
  "admin.tasks.editTask": { es: "Editar Tarea", en: "Edit Task" },
  "admin.tasks.deleteTask": { es: "Eliminar Tarea", en: "Delete Task" },
  "admin.tasks.taskTitle": { es: "Título de la Tarea", en: "Task Title" },
  "admin.tasks.description": { es: "Descripción", en: "Description" },
  "admin.tasks.bonusAmount": { es: "Monto del Bono (USDT)", en: "Bonus Amount (USDT)" },
  "admin.tasks.requiredDeposit": { es: "Depósito Requerido (USDT)", en: "Required Deposit (USDT)" },
  "admin.tasks.conditions": { es: "Condiciones", en: "Conditions" },
  "admin.tasks.addCondition": { es: "Agregar Condición", en: "Add Condition" },
  "admin.tasks.isActive": { es: "Tarea Activa", en: "Task Active" },
  "admin.tasks.save": { es: "Guardar Tarea", en: "Save Task" },
  "admin.tasks.cancel": { es: "Cancelar", en: "Cancel" },
  "admin.tasks.confirmDelete": { es: "¿Eliminar tarea?", en: "Delete task?" },
  "admin.tasks.confirmDelete.desc": { es: "Esta acción no se puede deshacer", en: "This action cannot be undone" },
  "admin.tasks.delete": { es: "Eliminar", en: "Delete" },
  "admin.tasks.noTasks": { es: "No hay tareas configuradas", en: "No tasks configured" },
  "admin.tasks.noTasks.desc": { es: "Crea una tarea para comenzar", en: "Create a task to get started" },
  "admin.tasks.success": { es: "Tarea guardada", en: "Task saved" },
  "admin.tasks.success.desc": {
    es: "La tarea ha sido guardada exitosamente",
    en: "The task has been saved successfully",
  },
  "admin.tasks.deleted": { es: "Tarea eliminada", en: "Task deleted" },
  "admin.tasks.deleted.desc": { es: "La tarea ha sido eliminada", en: "The task has been deleted" },
  "admin.tasks.manageTasks": { es: "Gestionar Tareas", en: "Manage Tasks" },
  "admin.tasks.manageTasks.desc": { es: "Configurar bonos y recompensas", en: "Configure bonuses and rewards" },
  "admin.tasks.durationDays": { es: "Duración (días)", en: "Duration (days)" },
  "admin.tasks.durationDays.desc": {
    es: "Días que el usuario tiene para completar la tarea después de ser elegible",
    en: "Days the user has to complete the task after becoming eligible",
  },
  "admin.tasks.noDuration": { es: "Sin límite de tiempo", en: "No time limit" },
  "admin.tasks.taskType": { es: "Tipo de Tarea", en: "Task Type" },
  "admin.tasks.type.registration": { es: "Bono de Registro", en: "Registration Bonus" },
  "admin.tasks.type.deposit_volume": { es: "Volumen de Depósitos", en: "Deposit Volume" },
  "admin.tasks.type.lottery_volume": { es: "Volumen de Sorteos", en: "Lottery Volume" },
  "admin.tasks.type.referral": { es: "Referidos", en: "Referrals" },
  "admin.tasks.type.custom": { es: "Personalizada", en: "Custom" },
  "admin.tasks.requirementType": { es: "Tipo de Requisito", en: "Requirement Type" },
  "admin.tasks.requirement.deposit": { es: "Depósito", en: "Deposit" },
  "admin.tasks.requirement.lottery_spending": { es: "Gasto en Sorteos", en: "Lottery Spending" },
  "admin.tasks.requirement.referrals": { es: "Referidos", en: "Referrals" },
  "admin.tasks.requirement.custom": { es: "Personalizado", en: "Custom" },
  "admin.tasks.requirementAmount": { es: "Monto Requerido (USDT)", en: "Required Amount (USDT)" },
  "admin.tasks.requirementCount": { es: "Cantidad Requerida", en: "Required Count" },
  "admin.tasks.userTargeting": { es: "Dirigido a", en: "Target Users" },
  "admin.tasks.targeting.all": { es: "Todos los Usuarios", en: "All Users" },
  "admin.tasks.targeting.new_users": { es: "Usuarios Nuevos (30 días)", en: "New Users (30 days)" },
  "admin.tasks.targeting.registered_after": { es: "Registrados Después de", en: "Registered After" },
  "admin.tasks.targeting.specific_users": { es: "Usuarios Específicos", en: "Specific Users" },
  "admin.tasks.registeredAfter": { es: "Fecha de Registro", en: "Registration Date" },
  "admin.tasks.validFrom": { es: "Válido Desde", en: "Valid From" },
  "admin.tasks.validUntil": { es: "Válido Hasta", en: "Valid Until" },
  "admin.tasks.maxCompletions": { es: "Máximo de Completaciones", en: "Max Completions" },
  "admin.tasks.currentCompletions": { es: "Completaciones Actuales", en: "Current Completions" },
  "admin.tasks.unlimited": { es: "Ilimitado", en: "Unlimited" },

  // Referrals
  "referrals.title": { es: "Programa de Referidos", en: "Referral Program" },
  "referrals.subtitle": { es: "Invita amigos y gana recompensas", en: "Invite friends and earn rewards" },
  "referrals.yourCode": { es: "Tu Código de Referido", en: "Your Referral Code" },
  "referrals.shareCode": { es: "Comparte tu código", en: "Share your code" },
  "referrals.copyCode": { es: "Copiar Código", en: "Copy Code" },
  "referrals.codeCopied": { es: "Código copiado", en: "Code copied" },
  "referrals.codeCopied.desc": {
    es: "Tu código ha sido copiado al portapapeles",
    en: "Your code has been copied to clipboard",
  },
  "referrals.howItWorks": { es: "Cómo Funciona", en: "How It Works" },
  "referrals.step1": { es: "Comparte tu código", en: "Share your code" },
  "referrals.step1.desc": { es: "Envía tu código único a tus amigos", en: "Send your unique code to your friends" },
  "referrals.step2": { es: "Ellos se registran", en: "They register" },
  "referrals.step2.desc": {
    es: "Tus amigos crean una cuenta usando tu código",
    en: "Your friends create an account using your code",
  },
  "referrals.step3": { es: "Ambos ganan", en: "Both earn" },
  "referrals.step3.desc": {
    es: "Recibes 5 USDT cuando hacen su primer depósito",
    en: "You receive 5 USDT when they make their first deposit",
  },
  "referrals.stats": { es: "Estadísticas", en: "Statistics" },
  "referrals.totalReferrals": { es: "Total Referidos", en: "Total Referrals" },
  "referrals.completed": { es: "Completados", en: "Completed" },
  "referrals.pending": { es: "Pendientes", en: "Pending" },
  "referrals.totalEarned": { es: "Total Ganado", en: "Total Earned" },
  "referrals.yourReferrals": { es: "Tus Referidos", en: "Your Referrals" },
  "referrals.user": { es: "Usuario", en: "User" },
  "referrals.date": { es: "Fecha", en: "Date" },
  "referrals.status": { es: "Estado", en: "Status" },
  "referrals.reward": { es: "Recompensa", en: "Reward" },
  "referrals.status.pending": { es: "Pendiente", en: "Pending" },
  "referrals.status.completed": { es: "Completado", en: "Completed" },
  "referrals.noReferrals": { es: "No tienes referidos aún", en: "You don't have referrals yet" },
  "referrals.noReferrals.desc": {
    es: "Comparte tu código para comenzar a ganar",
    en: "Share your code to start earning",
  },
  "referrals.shareLink": { es: "Compartir Enlace", en: "Share Link" },
  "referrals.linkCopied": { es: "Enlace copiado", en: "Link copied" },
  "referrals.linkCopied.desc": { es: "El enlace de referido ha sido copiado", en: "The referral link has been copied" },
  "referrals.howYouEarn": { es: "Cómo Ganas", en: "How You Earn" },
  "referrals.signupReward": { es: "Bono de Registro", en: "Signup Bonus" },
  "referrals.commission": { es: "Comisión", en: "Commission" },
  "referrals.commissionDesc": { es: "por cada compra de tus referidos", en: "on each purchase by your referrals" },
  "referrals.commissionEarned": { es: "Comisiones Ganadas", en: "Commissions Earned" },
  "referrals.earned": { es: "Ganado", en: "Earned" },

  // Admin Referrals
  "admin.referrals.title": { es: "Gestión de Referidos", en: "Referral Management" },
  "admin.referrals.subtitle": { es: "Administra el programa de referidos", en: "Manage referral program" },
  "admin.referrals.totalReferrals": { es: "Total Referidos", en: "Total Referrals" },
  "admin.referrals.completedReferrals": { es: "Referidos Completados", en: "Completed Referrals" },
  "admin.referrals.pendingReferrals": { es: "Referidos Pendientes", en: "Pending Referrals" },
  "admin.referrals.totalRewardsPaid": { es: "Recompensas Pagadas", en: "Rewards Paid" },
  "admin.referrals.allReferrals": { es: "Todos los Referidos", en: "All Referrals" },
  "admin.referrals.referrer": { es: "Referidor", en: "Referrer" },
  "admin.referrals.referred": { es: "Referido", en: "Referred" },
  "admin.referrals.code": { es: "Código", en: "Code" },
  "admin.referrals.noReferrals": { es: "No hay referidos registrados", en: "No referrals registered" },
  "admin.referrals.manageReferrals": { es: "Gestionar Referidos", en: "Manage Referrals" },
  "admin.referrals.manageReferrals.desc": { es: "Ver programa de referidos", en: "View referral program" },
  "admin.referrals.search": { es: "Buscar por nombre, email o código...", en: "Search by name, email or code..." },
  "admin.referrals.details": { es: "Detalles del Referido", en: "Referral Details" },
  "admin.referrals.details.desc": { es: "Información completa del referido", en: "Complete referral information" },
  "admin.referrals.reward": { es: "Recompensa", en: "Reward" },
  "admin.referrals.status": { es: "Estado", en: "Status" },
  "admin.referrals.completeReferral": { es: "Completar Referido", en: "Complete Referral" },
  "admin.referrals.completed": { es: "Referido completado", en: "Referral completed" },
  "admin.referrals.completed.desc": {
    es: "El referido ha sido completado y la recompensa ha sido pagada",
    en: "The referral has been completed and the reward has been paid",
  },
  "admin.referrals.settings": { es: "Configuración del Programa", en: "Program Settings" },
  "admin.referrals.signupRewardAmount": { es: "Recompensa por Registro (USDT)", en: "Signup Reward (USDT)" },
  "admin.referrals.signupRewardDesc": {
    es: "Cantidad que recibe el referidor cuando el referido hace su primer depósito",
    en: "Amount the referrer receives when the referred makes their first deposit",
  },
  "admin.referrals.commissionRate": { es: "Tasa de Comisión (%)", en: "Commission Rate (%)" },
  "admin.referrals.commissionRateDesc": {
    es: "Porcentaje que recibe el referidor por cada compra de tickets del referido",
    en: "Percentage the referrer receives on each ticket purchase by the referred",
  },
  "admin.referrals.signupRewards": { es: "Bonos de Registro", en: "Signup Bonuses" },
  "admin.referrals.commissionPaid": { es: "Comisiones Pagadas", en: "Commissions Paid" },
  "admin.referrals.settings.saved": {
    es: "La configuración del programa de referidos ha sido actualizada",
    en: "Referral program settings have been updated",
  },
}

interface I18nContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string, params?: Record<string, string | number>) => string
}

const I18nContext = createContext<I18nContextType | undefined>(undefined)

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>("es")

  useEffect(() => {
    const savedLang = localStorage.getItem("language") as Language
    if (savedLang && (savedLang === "es" || savedLang === "en")) {
      setLanguage(savedLang)
    }
  }, [])

  const handleSetLanguage = useCallback((lang: Language) => {
    setLanguage(lang)
    localStorage.setItem("language", lang)
  }, [])

  const t = useCallback(
    (key: string, params?: Record<string, string | number>): string => {
      let translation = translations[key]?.[language] || key

      if (params) {
        Object.entries(params).forEach(([paramKey, paramValue]) => {
          translation = translation.replace(`{${paramKey}}`, String(paramValue))
        })
      }

      return translation
    },
    [language]
  )

  const contextValue = useMemo(
    () => ({
      language,
      setLanguage: handleSetLanguage,
      t,
    }),
    [language, handleSetLanguage, t]
  )

  return <I18nContext.Provider value={contextValue}>{children}</I18nContext.Provider>
}

export function useI18n() {
  const context = useContext(I18nContext)
  if (!context) {
    throw new Error("useI18n must be used within I18nProvider")
  }
  return context
}
