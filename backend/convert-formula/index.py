import json
import os
from typing import Dict, Any
import urllib.request
import urllib.error

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Конвертирует текстовый запрос пользователя в формулу Excel через ChatGPT API
    Args: event - dict с httpMethod, body, queryStringParameters
          context - объект с атрибутами request_id, function_name
    Returns: HTTP response dict с формулой Excel
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
    language = body_data.get('language', 'ru')
    
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
    
    if language == 'ru':
        system_prompt = '''Ты эксперт по Excel формулам. Преобразуй запрос пользователя в готовую формулу Excel.

ВАЖНО: Когда пользователь говорит "столбец A" или "столбец T" - это означает ВСЕ ЯЧЕЙКИ столбца (A:A, T:T), а НЕ одну ячейку (A1, T1).
Для сравнения столбцов используй диапазоны типа A:A, B:B или A2:A100, B2:B100 (если нужно исключить заголовки).
Для формул массива с целыми столбцами используй A:A вместо A1.

Примеры:
- "сравнить столбец A и столбец B" → используй A:A и B:B, формула для всего столбца
- "сумма столбца A" → используй A:A или A2:A1000
- "если в A есть текст, то из B" → используй диапазоны A:A и B:B

Ответ должен быть в формате JSON:
{
  "formula": "формула начинающаяся с =",
  "explanation": "краткое объяснение что делает формула",
  "functions": [
    {
      "name": "название функции на русском (например СУММ)",
      "description": "что делает эта функция в контексте формулы"
    }
  ]
}
ОБЯЗАТЕЛЬНО используй РУССКИЕ названия функций (например СУММ вместо SUM, ЕСЛИ вместо IF, СРЗНАЧ вместо AVERAGE).'''
    else:
        system_prompt = '''You are an Excel formula expert. Convert user query into a ready-to-use Excel formula.

IMPORTANT: When user says "column A" or "column T" - it means ALL CELLS in that column (A:A, T:T), NOT a single cell (A1, T1).
For comparing columns, use ranges like A:A, B:B or A2:A100, B2:B100 (if you need to exclude headers).
For array formulas with entire columns, use A:A instead of A1.

Examples:
- "compare column A and column B" → use A:A and B:B, formula for entire column
- "sum of column A" → use A:A or A2:A1000
- "if A contains text, then from B" → use ranges A:A and B:B

Response must be in JSON format:
{
  "formula": "formula starting with =",
  "explanation": "brief explanation of what the formula does",
  "functions": [
    {
      "name": "function name in English (e.g., SUM)",
      "description": "what this function does in the context of the formula"
    }
  ]
}
ALWAYS use ENGLISH function names (e.g., SUM, IF, AVERAGE).'''
    
    chatgpt_request = {
        'model': 'gpt-4o-mini',
        'messages': [
            {
                'role': 'system',
                'content': system_prompt
            },
            {
                'role': 'user',
                'content': user_query
            }
        ],
        'temperature': 0.3,
        'max_tokens': 500
    }
    
    proxy_url = 'http://14a32408394ec:c40a74951e@45.11.154.112:12323/'
    proxy_handler = urllib.request.ProxyHandler({'http': proxy_url, 'https': proxy_url})
    opener = urllib.request.build_opener(proxy_handler)
    urllib.request.install_opener(opener)
    
    request_body = json.dumps(chatgpt_request).encode('utf-8')
    req = urllib.request.Request(
        'https://api.openai.com/v1/chat/completions',
        data=request_body,
        headers={
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {api_key}'
        },
        method='POST'
    )
    
    try:
        with urllib.request.urlopen(req, timeout=30) as response:
            response_data = json.loads(response.read().decode('utf-8'))
            content = response_data['choices'][0]['message']['content'].strip()
            
            try:
                result = json.loads(content)
            except json.JSONDecodeError:
                result = {
                    'formula': content,
                    'explanation': 'Формула создана успешно',
                    'functions': []
                }
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'isBase64Encoded': False,
                'body': json.dumps({
                    'formula': result.get('formula', content),
                    'explanation': result.get('explanation', ''),
                    'functions': result.get('functions', []),
                    'request_id': context.request_id
                })
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
            'body': json.dumps({
                'error': 'OpenAI API error',
                'details': error_body
            })
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'isBase64Encoded': False,
            'body': json.dumps({
                'error': 'Internal server error',
                'message': str(e)
            })
        }