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
    
    chatgpt_request = {
        'model': 'gpt-4o-mini',
        'messages': [
            {
                'role': 'system',
                'content': '''Ты эксперт по Excel формулам. Преобразуй запрос пользователя в готовую формулу Excel.
Ответ должен быть в формате JSON:
{
  "formula": "формула начинающаяся с =",
  "explanation": "краткое объяснение что делает формула",
  "functions": [
    {
      "name": "название функции",
      "description": "что делает эта функция в контексте формулы"
    }
  ]
}
Используй русские названия функций если пользователь пишет на русском (например СУММ вместо SUM).'''
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