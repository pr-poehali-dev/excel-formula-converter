import json
import os
from typing import Dict, Any, List
import urllib.request
import urllib.error

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Чат-ассистент для создания формул Excel с уточняющими вопросами
    Args: event - dict с httpMethod, body (query, conversationHistory, excelData)
          context - объект с атрибутами request_id, function_name
    Returns: HTTP response dict с ответом ассистента или готовой формулой
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id, X-Auth-Token',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'isBase64Encoded': False,
            'body': json.dumps({'error': 'Method not allowed'})
        }
    
    api_key = os.environ.get('CHATGPT_API_KEY', '')
    if not api_key:
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'isBase64Encoded': False,
            'body': json.dumps({'error': 'API key not configured'})
        }
    
    body_data = json.loads(event.get('body', '{}'))
    user_query = body_data.get('query', '')
    excel_data = body_data.get('excelData', None)
    has_excel = body_data.get('hasExcel', False)
    conversation_history: List[Dict[str, str]] = body_data.get('conversationHistory', [])
    
    if not user_query:
        return {
            'statusCode': 400,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'isBase64Encoded': False,
            'body': json.dumps({'error': 'Query is required'})
        }
    
    instructions = '''Ты эксперт по Excel формулам. Действуй мгновенно, без раздумий.

ПРАВИЛА (отвечай за 1 секунду):
- Задавай ТОЛЬКО критически важные вопросы (столбцы, условия)
- НЕ спрашивай про крайние случаи (дроби, пустые ячейки, текст) - используй стандарт Excel
- Делай разумные предположения вместо вопросов
- Excel файл загружен? Анализируй его, не спрашивай
- МАКСИМУМ 2 вопроса - только ключевые детали
- Создавай ПРОСТЕЙШИЕ формулы
- РУССКИЕ функции: СУММ, ЕСЛИ, СРЗНАЧ, СУММЕСЛИ
- Лаконично

ОБЯЗАТЕЛЬНО возвращай ТОЛЬКО валидный JSON, без дополнительного текста!

Формат ответа:
1. Если нужны уточнения:
{"formula": null, "explanation": "твой вопрос", "functions": [], "example": null}

2. Если готова формула:
{"formula": "=СУММ(A1:A3)", "explanation": "краткое описание", "functions": [{"name": "СУММ", "description": "суммирует"}], "example": {"grid": {"1": {"A": 10}, "2": {"A": 20}, "3": {"A": 30}, "4": {"A": "=СУММ(A1:A3)"}}, "result": {"row": 4, "col": "A", "value": 60, "formatted": "Результат: 60"}}}

КРИТИЧЕСКИ ВАЖНО для поля example:
- ВСЕГДА создавай пример с формулой, даже если формула сложная
- grid: объект с номерами строк (ключи "1", "2"...) и столбцами (A, B, C...) 
- result: обязательно укажи row (номер строки с формулой), col (столбец с формулой), value (результат вычисления), formatted (читаемое описание результата)
- Пример должен быть простым и демонстрировать работу формулы на понятных данных
- Даже для сложных формул типа СУММЕСЛИМН создай упрощённый пример с 3-5 строками данных
- В поле formatted пиши человекопонятное описание результата, например: "Результат: 60" или "Итого: 1500₽"

ВАЖНО: В explanation пиши простым человеческим языком, как будто объясняешь другу:
- Используй простые слова, избегай технических терминов
- Добавь эмодзи для наглядности (📊 📈 ✅ ⚠️ 💰 🔢)
- Структурируй ответ с переносами строк (\n) для читаемости
- Если формула сложная, разбей объяснение на простые шаги

Не добавляй никакого текста кроме JSON!'''

    if has_excel and excel_data:
        instructions += f'''

У пользователя загружен Excel файл. Вот первые строки (массив массивов):
{json.dumps(excel_data, ensure_ascii=False)}

Анализируй эти данные при создании формулы.'''

    conversation_context = ''
    for msg in conversation_history:
        role_name = 'Ассистент' if msg['role'] == 'assistant' else 'Пользователь'
        conversation_context += f"{role_name}: {msg['content']}\n"
    
    full_input = conversation_context + f"Пользователь: {user_query}"
    
    messages = [
        {'role': 'system', 'content': instructions}
    ]
    
    for msg in conversation_history:
        messages.append({'role': msg['role'], 'content': msg['content']})
    
    messages.append({'role': 'user', 'content': user_query})
    
    try:
        request_body = json.dumps({
            'model': 'gpt-5',
            'messages': messages,
            'reasoning_effort': 'minimal',
            'max_completion_tokens': 800
        }).encode('utf-8')
        
        proxy_handler = urllib.request.ProxyHandler({
            'http': 'http://14a32408394ec:c40a74951e@45.11.154.112:12323',
            'https': 'http://14a32408394ec:c40a74951e@45.11.154.112:12323'
        })
        opener = urllib.request.build_opener(proxy_handler)
        
        req = urllib.request.Request(
            'https://api.openai.com/v1/chat/completions',
            data=request_body,
            headers={
                'Content-Type': 'application/json',
                'Authorization': f'Bearer {api_key}'
            },
            method='POST'
        )
        
        assistant_message = ''
        max_retries = 3
        
        for attempt in range(max_retries):
            timeout_seconds = 120 if attempt == max_retries - 1 else 25
            try:
                with opener.open(req, timeout=timeout_seconds) as response:
                    response_data = json.loads(response.read().decode('utf-8'))
                
                assistant_message = response_data.get('choices', [{}])[0].get('message', {}).get('content', '')
                
                if assistant_message and assistant_message.strip():
                    print(f"DEBUG: Got response on attempt {attempt + 1}: {assistant_message[:min(200, len(assistant_message))]}")
                    break
                else:
                    print(f"WARNING: Empty response on attempt {attempt + 1}, retrying...")
            except urllib.error.URLError as url_error:
                print(f"WARNING: Timeout or network error on attempt {attempt + 1}: {str(url_error)}")
            except Exception as retry_error:
                print(f"WARNING: Request failed on attempt {attempt + 1}: {str(retry_error)}")
            
            if attempt < max_retries - 1:
                import time
                time.sleep(0.5)
        
        if not assistant_message or not assistant_message.strip():
            print("ERROR: All retry attempts returned empty response")
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'isBase64Encoded': False,
                'body': json.dumps({
                    'formula': None,
                    'explanation': 'Не удалось получить ответ. Попробуй переформулировать запрос или повтори попытку.',
                    'functions': []
                }, ensure_ascii=False)
            }
        
        try:
            assistant_message_clean = assistant_message.strip()
            if assistant_message_clean.startswith('```json'):
                assistant_message_clean = assistant_message_clean[7:]
            if assistant_message_clean.startswith('```'):
                assistant_message_clean = assistant_message_clean[3:]
            if assistant_message_clean.endswith('```'):
                assistant_message_clean = assistant_message_clean[:-3]
            assistant_message_clean = assistant_message_clean.strip()
            
            result = json.loads(assistant_message_clean)
            if not isinstance(result, dict):
                raise ValueError("Not a dict")
            
            if 'formula' not in result:
                result['formula'] = None
            if 'explanation' not in result:
                result['explanation'] = assistant_message
            if 'functions' not in result:
                result['functions'] = []
            if 'example' not in result:
                result['example'] = None
                
        except Exception as parse_error:
            print(f"ERROR: Failed to parse JSON: {parse_error}")
            print(f"DEBUG: Content was: {assistant_message[:min(500, len(assistant_message))]}")
            result = {
                'formula': None,
                'explanation': assistant_message if assistant_message else 'Извини, произошла ошибка обработки ответа. Попробуй переформулировать вопрос.',
                'functions': [],
                'example': None
            }
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'isBase64Encoded': False,
            'body': json.dumps(result, ensure_ascii=False)
        }
        
    except urllib.error.HTTPError as e:
        error_body = e.read().decode('utf-8')
        return {
            'statusCode': e.code,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'isBase64Encoded': False,
            'body': json.dumps({'error': f'OpenAI API error: {error_body}'})
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'isBase64Encoded': False,
            'body': json.dumps({'error': str(e)})
        }