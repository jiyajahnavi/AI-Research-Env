"""
Task definitions for the AI Research Scientist Environment.

Each task specifies:
    - A research problem
    - Paper summaries / prior knowledge
    - Available datasets and methods
    - Ground-truth optimal answers (for deterministic grading)
    - Difficulty level
    - Max steps

Tasks are pure data — no logic here.  The environment and graders
consume this data.
"""

TASKS = {
    # ═══════════════════════════════════════════════════════════════
    # TASK 1 — EASY: Controlled Research Setting
    # Clear signal, minimal noise, single correct answer
    # ═══════════════════════════════════════════════════════════════
    "task_easy_image_classification": {
        "task_id": "task_easy_image_classification",
        "difficulty": "easy",
        "max_steps": 12,
        "problem_statement": (
            "You are researching image classification for a dataset of "
            "handwritten digits (28×28 grayscale). The baseline model uses "
            "a Multi-Layer Perceptron (MLP) achieving 62% accuracy. "
            "Your goal is to identify the best approach to maximize accuracy. "
            "Available resources include two datasets and three methods."
        ),
        "paper_summaries": [
            {
                "paper_id": "paper_cnn_spatial",
                "title": "CNNs Exploit Spatial Structure in Image Data",
                "summary": (
                    "Convolutional Neural Networks leverage local spatial "
                    "correlations via learned filters. On image benchmarks, "
                    "CNNs consistently outperform fully-connected MLPs by "
                    "15-30% accuracy due to parameter sharing and "
                    "translation invariance."
                ),
                "key_finding": "CNN > MLP for spatial data",
                "relevance": 0.95,
            },
            {
                "paper_id": "paper_data_aug",
                "title": "Impact of Data Augmentation on Small Datasets",
                "summary": (
                    "Data augmentation techniques (rotation, flipping, "
                    "scaling) improve generalization by 5-10% on small "
                    "datasets. The effect diminishes as dataset size grows."
                ),
                "key_finding": "Augmentation helps small datasets",
                "relevance": 0.60,
            },
        ],
        "available_datasets": [
            {
                "dataset_id": "digits_full",
                "name": "Full Digit Dataset",
                "size": 60000,
                "description": "Complete handwritten digit dataset, 28x28 grayscale",
            },
            {
                "dataset_id": "digits_small",
                "name": "Small Digit Dataset",
                "size": 5000,
                "description": "Subset of the digit dataset for quick experiments",
            },
        ],
        "available_methods": [
            {
                "method_id": "mlp",
                "name": "Multi-Layer Perceptron",
                "description": "3-layer fully connected network",
                "expected_accuracy": {"digits_full": 0.72, "digits_small": 0.62},
            },
            {
                "method_id": "cnn",
                "name": "Convolutional Neural Network",
                "description": "2-conv + pooling + FC architecture",
                "expected_accuracy": {"digits_full": 0.95, "digits_small": 0.88},
            },
            {
                "method_id": "random_forest",
                "name": "Random Forest",
                "description": "Ensemble of 100 decision trees on flattened pixels",
                "expected_accuracy": {"digits_full": 0.83, "digits_small": 0.76},
            },
        ],
        "baseline_accuracy": 0.62,
        "optimal_method": "cnn",
        "optimal_dataset": "digits_full",
        "optimal_accuracy": 0.95,
        "ground_truth_hypothesis": (
            "CNNs are superior for image classification because they "
            "exploit spatial correlations in pixel data through "
            "convolutional filters and pooling operations."
        ),
        "ground_truth_keywords": [
            "cnn", "convolutional", "spatial", "filters",
            "pooling", "image", "classification",
        ],
    },

    # ═══════════════════════════════════════════════════════════════
    # TASK 2 — MEDIUM: Noisy Experimental Results
    # Results include randomness, some misleading signals
    # ═══════════════════════════════════════════════════════════════
    "task_medium_nlp_sentiment": {
        "task_id": "task_medium_nlp_sentiment",
        "difficulty": "medium",
        "max_steps": 12,
        "problem_statement": (
            "You are researching sentiment analysis for customer reviews. "
            "The baseline (bag-of-words logistic regression) achieves 68% "
            "F1-score. You must identify the best approach considering "
            "both accuracy and computational cost. Experimental results "
            "contain noise — repeated runs may yield different scores. "
            "You must form robust conclusions."
        ),
        "paper_summaries": [
            {
                "paper_id": "paper_transformers",
                "title": "Transformer Models for Text Classification",
                "summary": (
                    "Pre-trained transformer models (BERT, RoBERTa) achieve "
                    "state-of-the-art on sentiment analysis, with F1-scores "
                    "of 88-92%. However, they require significant compute "
                    "and fine-tuning."
                ),
                "key_finding": "Transformers achieve best accuracy but are expensive",
                "relevance": 0.90,
            },
            {
                "paper_id": "paper_lstm",
                "title": "LSTMs for Sequential Text Understanding",
                "summary": (
                    "LSTM networks capture sequential dependencies in text. "
                    "They achieve 78-82% F1 on sentiment tasks with moderate "
                    "compute requirements."
                ),
                "key_finding": "LSTMs offer good accuracy/compute trade-off",
                "relevance": 0.80,
            },
            {
                "paper_id": "paper_misleading",
                "title": "SVMs Outperform Deep Learning on Small Datasets",
                "summary": (
                    "On very small labeled datasets (<500 samples), SVMs can "
                    "outperform deep models. However, this advantage vanishes "
                    "with more data."
                ),
                "key_finding": "SVM advantage is limited to small data regimes",
                "relevance": 0.30,
            },
        ],
        "available_datasets": [
            {
                "dataset_id": "reviews_large",
                "name": "Customer Reviews (Large)",
                "size": 50000,
                "description": "50K labeled customer reviews, balanced classes",
            },
            {
                "dataset_id": "reviews_small",
                "name": "Customer Reviews (Small)",
                "size": 500,
                "description": "500 labeled customer reviews (noisy labels)",
            },
            {
                "dataset_id": "reviews_domain",
                "name": "Domain-Specific Reviews",
                "size": 15000,
                "description": "15K reviews from specific product category",
            },
        ],
        "available_methods": [
            {
                "method_id": "bow_logreg",
                "name": "Bag-of-Words + Logistic Regression",
                "description": "TF-IDF features with logistic regression",
                "expected_accuracy": {
                    "reviews_large": 0.72,
                    "reviews_small": 0.65,
                    "reviews_domain": 0.70,
                },
                "noise_std": 0.02,
            },
            {
                "method_id": "lstm",
                "name": "LSTM Network",
                "description": "Bidirectional LSTM with word embeddings",
                "expected_accuracy": {
                    "reviews_large": 0.81,
                    "reviews_small": 0.60,
                    "reviews_domain": 0.79,
                },
                "noise_std": 0.04,
            },
            {
                "method_id": "transformer",
                "name": "Fine-tuned BERT",
                "description": "BERT-base fine-tuned for sentiment",
                "expected_accuracy": {
                    "reviews_large": 0.91,
                    "reviews_small": 0.72,
                    "reviews_domain": 0.88,
                },
                "noise_std": 0.03,
            },
            {
                "method_id": "svm",
                "name": "SVM with TF-IDF",
                "description": "Support Vector Machine with TF-IDF features",
                "expected_accuracy": {
                    "reviews_large": 0.74,
                    "reviews_small": 0.68,
                    "reviews_domain": 0.71,
                },
                "noise_std": 0.05,
            },
        ],
        "baseline_accuracy": 0.68,
        "optimal_method": "transformer",
        "optimal_dataset": "reviews_large",
        "optimal_accuracy": 0.91,
        "ground_truth_hypothesis": (
            "Pre-trained transformer models (BERT) achieve the highest "
            "F1-score for sentiment analysis when fine-tuned on "
            "sufficiently large labeled datasets, due to contextual "
            "understanding of language."
        ),
        "ground_truth_keywords": [
            "transformer", "bert", "pre-trained", "fine-tune",
            "sentiment", "contextual", "large dataset",
        ],
    },

    # ═══════════════════════════════════════════════════════════════
    # TASK 3 — HARD: Conflicting Evidence + Resource Constraints
    # Contradictory results, limited experiment budget
    # ═══════════════════════════════════════════════════════════════
    "task_hard_tabular_prediction": {
        "task_id": "task_hard_tabular_prediction",
        "difficulty": "hard",
        "max_steps": 15,
        "problem_statement": (
            "You are researching prediction on a heterogeneous tabular "
            "dataset (mix of numerical and categorical features) for "
            "healthcare readmission prediction. The baseline (logistic "
            "regression) achieves AUC 0.58. You have a LIMITED budget of "
            "5 experiments. Different methods show conflicting results on "
            "different data subsets. You must carefully choose experiments "
            "to identify the best approach and form a nuanced conclusion. "
            "Note: some papers present contradictory findings."
        ),
        "paper_summaries": [
            {
                "paper_id": "paper_gbm_tabular",
                "title": "Gradient Boosting Dominates Tabular Data",
                "summary": (
                    "XGBoost/LightGBM consistently outperform deep learning "
                    "on tabular datasets. Meta-analysis across 45 benchmarks "
                    "shows tree-based methods win in 72% of cases."
                ),
                "key_finding": "GBMs are best for tabular data",
                "relevance": 0.95,
            },
            {
                "paper_id": "paper_deep_tabular",
                "title": "Deep Learning Can Beat Trees on Large Tabular Data",
                "summary": (
                    "On tabular datasets with >100K rows and complex "
                    "feature interactions, deep networks with proper "
                    "regularization can match or exceed GBMs. TabNet "
                    "achieves state-of-the-art on 5 of 11 benchmarks."
                ),
                "key_finding": "Deep learning competitive on large tabular data",
                "relevance": 0.70,
            },
            {
                "paper_id": "paper_feature_eng",
                "title": "Feature Engineering Still Matters",
                "summary": (
                    "Domain-specific feature engineering improves ANY "
                    "model's performance by 5-15%. Interaction features "
                    "and domain encoding are most impactful."
                ),
                "key_finding": "Feature engineering universally beneficial",
                "relevance": 0.85,
            },
            {
                "paper_id": "paper_ensemble",
                "title": "Ensemble Methods for Robust Predictions",
                "summary": (
                    "Stacking predictions from diverse models (GBM + NN + "
                    "linear) achieves 2-5% improvement over any single "
                    "model. Most effective when component models are diverse."
                ),
                "key_finding": "Diverse ensembles improve robustness",
                "relevance": 0.75,
            },
        ],
        "available_datasets": [
            {
                "dataset_id": "health_full",
                "name": "Full Healthcare Dataset",
                "size": 120000,
                "description": "120K patient records, 45 features, mixed types",
            },
            {
                "dataset_id": "health_subset_a",
                "name": "Healthcare Subset A (Urban)",
                "size": 30000,
                "description": "Urban hospitals only, potentially different distribution",
            },
            {
                "dataset_id": "health_subset_b",
                "name": "Healthcare Subset B (Rural)",
                "size": 20000,
                "description": "Rural hospitals, different feature distributions",
            },
        ],
        "available_methods": [
            {
                "method_id": "logreg",
                "name": "Logistic Regression",
                "description": "L2-regularized logistic regression",
                "expected_accuracy": {
                    "health_full": 0.65,
                    "health_subset_a": 0.63,
                    "health_subset_b": 0.60,
                },
                "noise_std": 0.02,
            },
            {
                "method_id": "xgboost",
                "name": "XGBoost",
                "description": "Gradient boosted trees with default hyperparams",
                "expected_accuracy": {
                    "health_full": 0.82,
                    "health_subset_a": 0.79,
                    "health_subset_b": 0.75,
                },
                "noise_std": 0.03,
            },
            {
                "method_id": "lightgbm",
                "name": "LightGBM",
                "description": "Light Gradient Boosting Machine",
                "expected_accuracy": {
                    "health_full": 0.83,
                    "health_subset_a": 0.80,
                    "health_subset_b": 0.74,
                },
                "noise_std": 0.03,
            },
            {
                "method_id": "tabnet",
                "name": "TabNet",
                "description": "Attention-based deep learning for tabular data",
                "expected_accuracy": {
                    "health_full": 0.80,
                    "health_subset_a": 0.77,
                    "health_subset_b": 0.70,
                },
                "noise_std": 0.05,
            },
            {
                "method_id": "xgb_feat_eng",
                "name": "XGBoost + Feature Engineering",
                "description": "XGBoost with domain-specific feature engineering",
                "expected_accuracy": {
                    "health_full": 0.87,
                    "health_subset_a": 0.84,
                    "health_subset_b": 0.80,
                },
                "noise_std": 0.02,
            },
            {
                "method_id": "ensemble",
                "name": "Stacked Ensemble (XGBoost + TabNet + LogReg)",
                "description": "Stacking ensemble of diverse models",
                "expected_accuracy": {
                    "health_full": 0.89,
                    "health_subset_a": 0.86,
                    "health_subset_b": 0.82,
                },
                "noise_std": 0.02,
            },
        ],
        "experiment_budget": 5,
        "baseline_accuracy": 0.58,
        "optimal_method": "ensemble",
        "optimal_dataset": "health_full",
        "optimal_accuracy": 0.89,
        "ground_truth_hypothesis": (
            "For heterogeneous tabular healthcare data, a stacked ensemble "
            "of gradient boosting (with feature engineering) and deep "
            "tabular models achieves the best AUC, leveraging both the "
            "tree-based models' strength on tabular data and the neural "
            "network's ability to capture complex interactions."
        ),
        "ground_truth_keywords": [
            "ensemble", "gradient boosting", "xgboost", "tabular",
            "feature engineering", "stacking", "diverse models",
            "healthcare",
        ],
    },
}


def get_task(task_id: str) -> dict:
    """Return a task definition by ID. Raises KeyError if not found."""
    return TASKS[task_id]


def list_task_ids() -> list:
    """Return list of all available task IDs."""
    return list(TASKS.keys())


def list_tasks_by_difficulty(difficulty: str) -> list:
    """Return task IDs matching the given difficulty."""
    return [
        tid for tid, t in TASKS.items()
        if t["difficulty"] == difficulty
    ]
