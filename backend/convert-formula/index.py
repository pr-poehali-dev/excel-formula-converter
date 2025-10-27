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
    
    system_prompt = '''Ты эксперт-ассистент по Excel формулам. Твоя задача - помочь пользователю создать нужную формулу.

ВАЖНО:
- Если запрос недостаточно конкретный - задай уточняющие вопросы
- Если пользователь загрузил Excel файл - анализируй его структуру (столбцы, данные)
- Когда достаточно информации - создай готовую формулу
- Используй РУССКИЕ названия функций (СУММ, ЕСЛИ, СРЗНАЧ, ОСТАТ и т.д.)
- Будь дружелюбным и помогай разобраться

Формат ответа:
1. Если нужны уточнения - верни JSON:
{
  "formula": null,
  "explanation": "твой вопрос пользователю",
  "functions": []
}

2. Если готова формула - верни JSON:
{
  "formula": "=СУММ(A:A)",
  "explanation": "Эта формула суммирует все значения в столбце A",
  "functions": [{"name": "СУММ", "description": "суммирует значения"}]
}'''

    if has_excel and excel_data:
        system_prompt += f'''

У пользователя загружен Excel файл. Вот первые строки (массив массивов):
{json.dumps(excel_data, ensure_ascii=False)}

Анализируй эти данные при создании формулы.'''

    messages = [
        {'role': 'system', 'content': system_prompt}
    ]
    
    for msg in conversation_history:
        messages.append({'role': msg['role'], 'content': msg['content']})
    
    messages.append({'role': 'user', 'content': user_query})
    
    try:
        request_body = json.dumps({
            'model': 'gpt-4o-mini',
            'messages': messages,
            'temperature': 0.7,
            'max_tokens': 800
        }).encode('utf-8')
        
        req = urllib.request.Request(
            'https://api.openai.com/v1/chat/completions',
            data=request_body,
            headers={
                'Content-Type': 'application/json',
                'Authorization': f'Bearer {api_key}'
            },
            method='POST'
        )
        
        with urllib.request.urlopen(req, timeout=30) as response:
            response_data = json.loads(response.read().decode('utf-8'))
        
        assistant_message = response_data['choices'][0]['message']['content']
        
        try:
            result = json.loads(assistant_message)
            if not isinstance(result, dict):
                raise ValueError("Not a dict")
        except:
            result = {
                'formula': None,
                'explanation': assistant_message,
                'functions': []
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
