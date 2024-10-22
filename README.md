# Subscription service

Микросервис управляющий пользователями Adobe
и предоставляющие сессионый доступ к подписке.
В рамках сессии пользователю (не Adobe) по мере расходования подписки
выдаются новые Adobe аккаунты.

В процессе работы сервис переодически проверяет наличие подписки у аккаунтов
закрепленных за активными сессиями и если подписка слетает,
то создает новый аккаунт и вызывает webhook,
что бы уведомить пользователя микросервиса

# API

## POST `/sessions`

Открыть новую сессию

### Response

```json
"some-session-id"
```

## GET `/sessions/{id}`

Получить данные аккаунта закрепленного за сессией

### Response

```json
{
  "email": "account-email",
  "password": "account-password"
}
```

## DELETE `/sessions/{id}`

Закрыть сессию

# Webhook

> [!NOTE]
> URL для webhook указывается через переменную
> окружения `SESSION_UPDATED_WEBHOOK_URL`

## POST `SESSION_UPDATED_WEBHOOK_URL`

Отправить пользователю новые данные аккаунты

### Body

```json
{
  "session": "some-session-id",
  "email": "new-account-email",
  "password": "new-account-password"
}
```

