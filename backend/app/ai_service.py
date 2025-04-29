"""
AI Service Module

This module provides intelligent todo suggestion generation based on:
- Existing todo items
- Time of day
- Task patterns and categories
- Urgency levels

The service uses a combination of pattern matching and contextual analysis
to generate relevant suggestions without relying on external APIs.
"""

import os
import requests
from typing import List, Tuple, Optional
from dotenv import load_dotenv
from datetime import datetime, timedelta
import logging
import random
import re
from langdetect import detect, LangDetectException
import hashlib

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

DEEPSEEK_API_KEY = os.getenv("DEEPSEEK_API_KEY")
DEEPSEEK_API_URL = "https://api.deepseek.com/v1/chat/completions"

# Language-specific suggestions
LANGUAGE_SUGGESTIONS = {
    'en': {
        'time_based': {
            'morning': [
                "Review yesterday's progress",
                "Plan today's tasks",
                "Morning exercise routine",
                "Breakfast and hydration"
            ],
            'lunch': [
                "Lunch break",
                "Quick walk outside",
                "Meditation session",
                "Review morning tasks"
            ],
            'afternoon': [
                "Afternoon check-in",
                "Team sync meeting",
                "Review project status",
                "Prepare for tomorrow"
            ],
            'evening': [
                "Evening reflection",
                "Plan for tomorrow",
                "Relaxation time",
                "Review completed tasks"
            ]
        },
        'urgency': {
            3: [
                "Immediate action required",
                "Critical issue resolution",
                "Emergency response",
                "Urgent deadline task"
            ],
            2: [
                "Priority task completion",
                "Important follow-up",
                "Time-sensitive action",
                "Key milestone work"
            ],
            1: [
                "Long-term planning",
                "Routine maintenance",
                "Optional improvements",
                "Future preparation"
            ]
        },
        'patterns': {
            'school': [
                "Prepare class materials",
                "Review course syllabus",
                "Organize study notes",
                "Check assignment deadlines",
                "Update class schedule",
                "Create study plan",
                "Review lecture notes",
                "Complete practice problems",
                "Prepare for upcoming exams",
                "Join study group"
            ],
            'study': [
                "Practice {subject} exercises",
                "Review {subject} notes",
                "Create {subject} summary",
                "Apply {subject} concepts"
            ],
            'read': [
                "Take reading notes",
                "Highlight key points",
                "Create summary",
                "Apply concepts learned"
            ],
            'write': [
                "Outline structure",
                "Review draft",
                "Edit content",
                "Format document"
            ],
            'plan': [
                "Break down tasks",
                "Set milestones",
                "Allocate resources",
                "Create timeline"
            ],
            'test': [
                "Review test cases",
                "Document results",
                "Fix issues found",
                "Update documentation"
            ],
            'review': [
                "Gather feedback",
                "Implement changes",
                "Update documentation",
                "Communicate updates"
            ]
        }
    },
    'zh': {
        'time_based': {
            'morning': [
                "回顾昨天的进展",
                "计划今天的任务",
                "晨间锻炼",
                "早餐和补水"
            ],
            'lunch': [
                "午休时间",
                "户外散步",
                "冥想练习",
                "回顾上午任务"
            ],
            'afternoon': [
                "下午检查",
                "团队同步会议",
                "项目状态回顾",
                "准备明天工作"
            ],
            'evening': [
                "晚间反思",
                "计划明天",
                "放松时间",
                "回顾已完成任务"
            ]
        },
        'urgency': {
            3: [
                "需要立即行动",
                "解决关键问题",
                "紧急响应",
                "紧急截止日期任务"
            ],
            2: [
                "优先任务完成",
                "重要跟进",
                "时间敏感行动",
                "关键里程碑工作"
            ],
            1: [
                "长期规划",
                "日常维护",
                "可选改进",
                "未来准备"
            ]
        },
        'patterns': {
            'study': [
                "练习{subject}习题",
                "复习{subject}笔记",
                "创建{subject}总结",
                "应用{subject}概念"
            ],
            'read': [
                "做阅读笔记",
                "标记重点",
                "创建摘要",
                "应用所学概念"
            ],
            'write': [
                "概述结构",
                "审阅草稿",
                "编辑内容",
                "格式化文档"
            ],
            'plan': [
                "分解任务",
                "设定里程碑",
                "分配资源",
                "创建时间线"
            ],
            'test': [
                "审查测试用例",
                "记录结果",
                "修复发现的问题",
                "更新文档"
            ],
            'review': [
                "收集反馈",
                "实施更改",
                "更新文档",
                "沟通更新"
            ]
        }
    },
    'ja': {
        'time_based': {
            'morning': [
                "昨日の進捗を確認",
                "今日のタスクを計画",
                "朝の運動",
                "朝食と水分補給"
            ],
            'lunch': [
                "昼休み",
                "外を散歩",
                "瞑想セッション",
                "午前のタスクを確認"
            ],
            'afternoon': [
                "午後の確認",
                "チーム同期ミーティング",
                "プロジェクト状況の確認",
                "明日の準備"
            ],
            'evening': [
                "夜の振り返り",
                "明日の計画",
                "リラックスタイム",
                "完了したタスクの確認"
            ]
        },
        'urgency': {
            3: [
                "即時対応が必要",
                "重要問題の解決",
                "緊急対応",
                "緊急締切タスク"
            ],
            2: [
                "優先タスクの完了",
                "重要なフォローアップ",
                "時間に敏感な行動",
                "主要マイルストーンの作業"
            ],
            1: [
                "長期計画",
                "日常メンテナンス",
                "オプションの改善",
                "将来の準備"
            ]
        },
        'patterns': {
            'study': [
                "{subject}の練習問題",
                "{subject}のノートを復習",
                "{subject}の要約を作成",
                "{subject}の概念を適用"
            ],
            'read': [
                "読書ノートを作成",
                "重要なポイントをマーク",
                "要約を作成",
                "学んだ概念を適用"
            ],
            'write': [
                "構造をアウトライン",
                "草稿を確認",
                "内容を編集",
                "ドキュメントをフォーマット"
            ],
            'plan': [
                "タスクを分解",
                "マイルストーンを設定",
                "リソースを割り当て",
                "タイムラインを作成"
            ],
            'test': [
                "テストケースを確認",
                "結果を記録",
                "見つかった問題を修正",
                "ドキュメントを更新"
            ],
            'review': [
                "フィードバックを収集",
                "変更を実装",
                "ドキュメントを更新",
                "更新をコミュニケーション"
            ]
        }
    }
}

class AIService:
    """
    AI Service class for generating intelligent todo suggestions.
    
    Features:
    - Pattern-based suggestion generation
    - Time-based contextual suggestions
    - Urgency-aware suggestions
    - Language detection and support
    """
    
    def __init__(self):
        """Initialize the AI service with predefined patterns and categories."""
        # Define common task patterns and their follow-up actions
        self.task_patterns = {
            'learn': {
                'patterns': ['learn', 'study', 'read about', 'research'],
                'follow_ups': [
                    'Take notes on {subject}',
                    'Create a summary of {subject}',
                    'Practice {subject} concepts',
                    'Find examples of {subject}'
                ]
            },
            'read': {
                'patterns': ['read', 'go through', 'review'],
                'follow_ups': [
                    'Summarize key points',
                    'Create action items from reading',
                    'Share insights with team',
                    'Apply concepts learned'
                ]
            },
            'write': {
                'patterns': ['write', 'draft', 'create'],
                'follow_ups': [
                    'Review and edit',
                    'Get feedback',
                    'Format and structure',
                    'Add examples'
                ]
            },
            'plan': {
                'patterns': ['plan', 'organize', 'schedule'],
                'follow_ups': [
                    'Break down into tasks',
                    'Set deadlines',
                    'Allocate resources',
                    'Create timeline'
                ]
            },
            'test': {
                'patterns': ['test', 'verify', 'check'],
                'follow_ups': [
                    'Document results',
                    'Fix issues found',
                    'Update test cases',
                    'Report findings'
                ]
            },
            'review': {
                'patterns': ['review', 'analyze', 'evaluate'],
                'follow_ups': [
                    'Create summary',
                    'Identify improvements',
                    'Share feedback',
                    'Update documentation'
                ]
            }
        }
        
        # Define time-based suggestions
        self.time_based_suggestions = {
            'morning': [
                'Plan your day',
                'Review yesterday\'s progress',
                'Set daily goals',
                'Check calendar'
            ],
            'lunch': [
                'Take a break',
                'Review morning tasks',
                'Plan afternoon',
                'Quick walk'
            ],
            'afternoon': [
                'Review progress',
                'Prepare for tomorrow',
                'Clean up workspace',
                'Update documentation'
            ],
            'evening': [
                'Review completed tasks',
                'Plan for tomorrow',
                'Organize notes',
                'Relax and unwind'
            ]
        }

    def detect_language(self, text: str) -> str:
        """
        Detect the language of the input text.
        
        Args:
            text: The text to analyze
            
        Returns:
            str: Language code ('zh' for Chinese, 'ja' for Japanese, 'en' for English)
        """
        try:
            # Check for Japanese characters first (since Kanji overlaps with Chinese)
            if any('\u3040' <= char <= '\u309f' or  # Hiragana
                   '\u30a0' <= char <= '\u30ff' or  # Katakana
                   '\u4e00' <= char <= '\u9fff' for char in text):  # Kanji
                # Additional check for Japanese-specific patterns
                if any(word in text.lower() for word in ['の', 'を', 'に', 'は', 'が', 'で', 'と', 'も', 'から', 'まで']):
                    return 'ja'
            
            # Check for Chinese characters
            if any('\u4e00' <= char <= '\u9fff' for char in text):
                return 'zh'
            
            # Default to English for other cases
            return 'en'
        except Exception as e:
            logger.error(f"Error detecting language: {e}")
            return 'en'

    def extract_subject(self, text: str) -> Optional[str]:
        """
        Extract the main subject from a todo title.
        
        Args:
            text: The todo title
            
        Returns:
            Optional[str]: The extracted subject or None if not found
        """
        # Remove common verbs and prepositions
        text = re.sub(r'\b(learn|study|read|write|create|plan|test|review|about|on|for)\b', '', text, flags=re.IGNORECASE)
        return text.strip() if text.strip() else None

    def get_time_based_suggestions(self) -> List[str]:
        """
        Get suggestions based on the current time of day.
        
        Returns:
            List[str]: List of time-appropriate suggestions
        """
        hour = datetime.now().hour
        if 5 <= hour < 12:
            return self.time_based_suggestions['morning']
        elif 12 <= hour < 14:
            return self.time_based_suggestions['lunch']
        elif 14 <= hour < 18:
            return self.time_based_suggestions['afternoon']
        else:
            return self.time_based_suggestions['evening']

    def generate_todo_suggestion(self, existing_todos: List[str], urgency: int = 1) -> List[str]:
        """
        Generate todo suggestions based on existing todos and urgency level.
        
        Args:
            existing_todos: List of existing todo titles
            urgency: Urgency level (1-3)
            
        Returns:
            List[str]: List of generated suggestions
        """
        suggestions = []
        
        # Add time-based suggestions
        suggestions.extend(self.get_time_based_suggestions())
        
        # Process each existing todo
        for todo in existing_todos:
            # Extract subject for context
            subject = self.extract_subject(todo)
            
            # Generate suggestions based on task patterns
            for category, data in self.task_patterns.items():
                if any(pattern in todo.lower() for pattern in data['patterns']):
                    for follow_up in data['follow_ups']:
                        if subject:
                            suggestions.append(follow_up.format(subject=subject))
                        else:
                            suggestions.append(follow_up)
        
        # Remove duplicates
        suggestions = list(set(suggestions))
        
        # Use hash of todo list to select multiple suggestions consistently
        if suggestions:
            hash_value = int(hashlib.md5(str(existing_todos).encode()).hexdigest(), 16)
            # Select up to 5 suggestions based on the hash
            num_suggestions = min(5, len(suggestions))
            selected_indices = [(hash_value + i) % len(suggestions) for i in range(num_suggestions)]
            return [suggestions[i] for i in selected_indices]
        
        return []

def is_long_task(title: str) -> bool:
    """Check if a task is long enough to be broken down into subtasks."""
    # Consider a task long if it has more than 4 words or contains conjunctions
    words = title.split()
    has_conjunctions = any(word.lower() in ['and', 'or', 'but', 'then', 'after', 'before'] for word in words)
    return len(words) > 4 or has_conjunctions

def break_down_task(title: str) -> List[str]:
    """Break down a long task into subtasks."""
    # Common patterns for breaking down tasks
    patterns = {
        'and': ' and ',
        'or': ' or ',
        'then': ' then ',
        'after': ' after ',
        'before': ' before ',
        'comma': ', ',
    }
    
    # Try to split by different patterns
    for pattern in patterns.values():
        if pattern in title.lower():
            parts = [part.strip() for part in title.split(pattern) if part.strip()]
            if len(parts) > 1:
                return parts
    
    # If no clear split pattern, try to break down by verbs
    verbs = ['create', 'implement', 'develop', 'write', 'design', 'build', 'test', 'review']
    for verb in verbs:
        if verb in title.lower():
            # Find the verb and split the sentence
            match = re.search(rf'\b{verb}\b', title.lower())
            if match:
                before = title[:match.start()].strip()
                after = title[match.end():].strip()
                if before and after:
                    return [f"{verb} {after}", before]
    
    # If no clear breakdown, return the original task
    return [title]

def convert_relative_time(time_expr: str) -> str:
    """Convert relative time expressions to specific dates."""
    now = datetime.now()
    time_expr = time_expr.lower()
    
    # Today expressions
    if "today" in time_expr:
        if "end of today" in time_expr or "by today" in time_expr:
            return f"by {now.strftime('%Y-%m-%d')} 23:59"
        return f"by {now.strftime('%Y-%m-%d')}"
    
    # Tomorrow expressions
    if "tomorrow" in time_expr:
        tomorrow = now + timedelta(days=1)
        if "end of tomorrow" in time_expr or "by tomorrow" in time_expr:
            return f"by {tomorrow.strftime('%Y-%m-%d')} 23:59"
        return f"by {tomorrow.strftime('%Y-%m-%d')}"
    
    # This week expressions
    if "this week" in time_expr:
        end_of_week = now + timedelta(days=(6 - now.weekday()))
        return f"by {end_of_week.strftime('%Y-%m-%d')} 23:59"
    
    # Next week expressions
    if "next week" in time_expr:
        start_of_next_week = now + timedelta(days=(7 - now.weekday()))
        return f"by {start_of_next_week.strftime('%Y-%m-%d')}"
    
    return time_expr

def extract_time_expression(title: str) -> Tuple[Optional[str], str]:
    """Extract time expression from a task title and return the time expression and the remaining task."""
    # Common time patterns
    time_patterns = [
        r'(?:at|by|before|after|during|until|from|to)\s+\d{1,2}(?::\d{2})?\s*(?:am|pm)?',
        r'(?:at|by|before|after|during|until|from|to)\s+(?:morning|afternoon|evening|night|noon|midnight)',
        r'(?:at|by|before|after|during|until|from|to)\s+(?:today|tomorrow|yesterday|this\s+week|next\s+week)',
        r'(?:at|by|before|after|during|until|from|to)\s+(?:monday|tuesday|wednesday|thursday|friday|saturday|sunday)',
        r'(?:at|by|before|after|during|until|from|to)\s+(?:january|february|march|april|may|june|july|august|september|october|november|december)',
        r'(?:at|by|before|after|during|until|from|to)\s+the\s+end\s+of\s+(?:today|tomorrow|this\s+week|next\s+week)',
        r'(?:at|by|before|after|during|until|from|to)\s+the\s+beginning\s+of\s+(?:tomorrow|next\s+week)'
    ]
    
    for pattern in time_patterns:
        match = re.search(pattern, title.lower())
        if match:
            time_expr = match.group(0)
            # Convert relative time expressions to specific dates
            converted_time = convert_relative_time(time_expr)
            # Remove the time expression from the original title
            remaining = title[:match.start()] + title[match.end():]
            return converted_time.strip(), remaining.strip()
    
    return None, title

def generate_todo_suggestion(existing_todos: List[str], urgency: int) -> List[str]:
    """
    Generate multiple todo suggestions based on existing todos and urgency level.
    Returns up to 5 suggestions, removing duplicates and using a hash-based selection
    for consistency.
    """
    suggestions = set()
    
    # Get language of the first todo (default to English if detection fails)
    lang = 'en'
    if existing_todos:
        try:
            # Check for Chinese characters first
            if any('\u4e00' <= char <= '\u9fff' for char in existing_todos[0]):
                lang = 'zh'
            else:
                detected_lang = detect(existing_todos[0])
                # Only use supported languages, default to English for others
                lang = detected_lang if detected_lang in LANGUAGE_SUGGESTIONS else 'en'
        except (LangDetectException, Exception) as e:
            logger.warning(f"Language detection failed: {e}. Defaulting to English.")
            lang = 'en'
    
    # Add time-based suggestions
    current_hour = datetime.now().hour
    time_suggestions = LANGUAGE_SUGGESTIONS[lang]['time_based']
    if 5 <= current_hour < 12:
        suggestions.update(time_suggestions['morning'])
    elif 12 <= current_hour < 14:
        suggestions.update(time_suggestions['lunch'])
    elif 14 <= current_hour < 18:
        suggestions.update(time_suggestions['afternoon'])
    else:
        suggestions.update(time_suggestions['evening'])
    
    # Add urgency-based suggestions
    urgency_suggestions = LANGUAGE_SUGGESTIONS[lang]['urgency'].get(urgency, [])
    suggestions.update(urgency_suggestions)
    
    # Add pattern-based suggestions
    for todo in existing_todos:
        # Extract subject if present
        subject = extract_subject(todo)
        
        # Add suggestions based on detected patterns
        for pattern in LANGUAGE_SUGGESTIONS[lang]['patterns']:
            if pattern in todo.lower():
                pattern_suggestions = LANGUAGE_SUGGESTIONS[lang]['patterns'][pattern]
                if subject:
                    suggestions.update(s.format(subject=subject) for s in pattern_suggestions)
                else:
                    suggestions.update(pattern_suggestions)
    
    # Convert suggestions to list and remove any empty strings
    suggestions = [s for s in suggestions if s.strip()]
    
    # Use hash of existing todos and urgency to consistently select suggestions
    hash_input = ''.join(existing_todos) + str(urgency)
    hash_value = int(hashlib.md5(hash_input.encode()).hexdigest(), 16)
    random.seed(hash_value)
    
    # Select up to 5 suggestions
    if suggestions:
        selected = random.sample(suggestions, min(5, len(suggestions)))
        return selected
    
    # Fallback suggestions if no patterns matched
    return [
        LANGUAGE_SUGGESTIONS[lang]['urgency'][urgency][0],
        LANGUAGE_SUGGESTIONS[lang]['time_based']['morning'][0]
    ]

def extract_subject(todo: str) -> str:
    """Extract the subject from a todo."""
    # Remove common verbs and articles
    words = todo.lower().split()
    subject_words = [word for word in words if word not in ['study', 'learn', 'about', 'the', 'a', 'an']]
    return ' '.join(subject_words) if subject_words else 'the subject'

def generate_fallback_suggestion(existing_todos: List[str]) -> str:
    """Generate a todo suggestion using simple pattern matching when AI is unavailable."""
    last_todo = existing_todos[-1].lower()
    if "learn" in last_todo or "study" in last_todo:
        return f"Practice what you learned about {last_todo.split()[-1]}"
    elif "read" in last_todo:
        return "Take notes on your reading"
    elif "write" in last_todo or "create" in last_todo:
        return "Review and edit your work"
    else:
        return f"Follow up on: {existing_todos[-1]}" 