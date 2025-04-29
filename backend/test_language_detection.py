from app.ai_service import detect_language, generate_todo_suggestion

def test_language_detection_and_suggestions():
    # Test cases for different languages and scenarios
    test_cases = [
        # Chinese cases
        ("收拾行李", "Packing scenario"),
        ("学习Python编程", "Study scenario"),
        ("阅读文档", "Reading scenario"),
        ("整理房间", "Organizing scenario"),
        
        # Mixed language cases
        ("Study Python编程", "Mixed language"),
        ("Read 论文", "Mixed language"),
        
        # Short text cases
        ("写代码", "Short Chinese text"),
        ("学习", "Single word Chinese"),
        
        # Special characters
        ("整理文件📁", "With emoji"),
        ("学习C++", "With special characters")
    ]
    
    print("=== Language Detection Tests ===\n")
    for todo, scenario in test_cases:
        lang = detect_language(todo)
        print(f"Scenario: {scenario}")
        print(f"Input: '{todo}'")
        print(f"Detected Language: {lang}\n")
    
    print("\n=== Suggestion Generation Tests ===\n")
    
    # Test packing scenario with different urgency levels
    packing_todo = "收拾行李"
    print(f"Testing packing scenario: '{packing_todo}'\n")
    
    for urgency in [3, 2, 1]:
        print(f"Urgency Level {urgency} suggestions:")
        suggestions = generate_todo_suggestion([packing_todo], urgency)
        for suggestion in suggestions:
            print(f"- {suggestion}")
        print()
    
    # Test study scenario
    study_todo = "学习Python编程"
    print(f"\nTesting study scenario: '{study_todo}'\n")
    for urgency in [3, 2, 1]:
        print(f"Urgency Level {urgency} suggestions:")
        suggestions = generate_todo_suggestion([study_todo], urgency)
        for suggestion in suggestions:
            print(f"- {suggestion}")
        print()
    
    # Test context awareness with multiple todos
    print("\nTesting context awareness with multiple todos:")
    todos = ["收拾行李", "准备护照", "订机票"]
    print("Input todos:", todos)
    suggestions = generate_todo_suggestion(todos, 2)
    print("\nSuggestions:")
    for suggestion in suggestions:
        print(f"- {suggestion}")

if __name__ == "__main__":
    test_language_detection_and_suggestions() 