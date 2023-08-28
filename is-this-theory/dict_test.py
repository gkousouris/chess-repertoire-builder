def traverse_dict_with_latest_parent(dictionary, latest_parent=None):
    for key, value in dictionary.items():
        current_parent = key if latest_parent is None else latest_parent
        print(f"Element: {key}, Parent: {current_parent}")
        if isinstance(value, dict) and len(value) > 0:
            traverse_dict_with_latest_parent(value, current_parent)

data = {
    "e4": {
        "e5": {}
    },
    "Nf3": {
        "d5": {
            "g3": {
                "Nf6": {}
            }
        }
    }
}

traverse_dict_with_latest_parent(data)
