import { cn } from '@/lib/utils';

interface BaseQuestionProps {
  value: unknown;
  onChange: (value: unknown) => void;
  className?: string;
}

interface MultipleChoiceProps extends BaseQuestionProps {
  options: string[];
  name: string;
}

interface CheckboxProps extends BaseQuestionProps {
  options: string[];
}

interface TextInputProps extends BaseQuestionProps {
  placeholder?: string;
  maxLength?: number;
}

interface RatingProps extends BaseQuestionProps {
  min: number;
  max: number;
}

export function MultipleChoiceInput({
  options,
  name,
  value,
  onChange,
  className
}: MultipleChoiceProps) {
  return (
    <div className={cn('space-y-3', className)}>
      {options.map((option, index) => (
        <label key={index} className="flex items-center space-x-3 cursor-pointer group">
          <input
            type="radio"
            name={name}
            value={option}
            checked={value === option}
            onChange={(e) => onChange(e.target.value)}
            className="w-4 h-4 text-brand-600 focus:ring-brand-200 focus:ring-2 border-ink-300"
          />
          <span className="text-ink-700 group-hover:text-ink-900 transition-colors">
            {option}
          </span>
        </label>
      ))}
    </div>
  );
}

export function CheckboxInput({
  options,
  value,
  onChange,
  className
}: CheckboxProps) {
  const currentValues = Array.isArray(value) ? value : [];

  const handleChange = (option: string, checked: boolean) => {
    if (checked) {
      onChange([...currentValues, option]);
    } else {
      onChange(currentValues.filter((val: string) => val !== option));
    }
  };

  return (
    <div className={cn('space-y-3', className)}>
      {options.map((option, index) => (
        <label key={index} className="flex items-center space-x-3 cursor-pointer group">
          <input
            type="checkbox"
            value={option}
            checked={currentValues.includes(option)}
            onChange={(e) => handleChange(option, e.target.checked)}
            className="w-4 h-4 text-brand-600 focus:ring-brand-200 focus:ring-2 border-ink-300 rounded"
          />
          <span className="text-ink-700 group-hover:text-ink-900 transition-colors">
            {option}
          </span>
        </label>
      ))}
    </div>
  );
}

export function TextInput({
  value,
  onChange,
  placeholder = "Enter your answer...",
  maxLength,
  className
}: TextInputProps) {
  return (
    <div className={cn('space-y-2', className)}>
      <textarea
        value={typeof value === 'string' ? value : ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
        rows={4}
        className="w-full px-4 py-3 border border-ink-200 rounded-xl focus:border-brand-500 focus:ring-2 focus:ring-brand-200 focus:outline-none resize-none transition-colors text-ink-900 placeholder:text-ink-400"
      />
      {maxLength && (
        <div className="text-right text-sm text-ink-500">
          {(typeof value === 'string' ? value : '').length} / {maxLength}
        </div>
      )}
    </div>
  );
}

export function RatingInput({
  min,
  max,
  value,
  onChange,
  className
}: RatingProps) {
  const range = Array.from({ length: max - min + 1 }, (_, i) => min + i);

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex justify-between text-sm text-ink-600">
        <span>{min}</span>
        <span>{max}</span>
      </div>
      <div className="flex flex-wrap gap-2 justify-center">
        {range.map((num) => (
          <button
            key={num}
            type="button"
            onClick={() => onChange(num)}
            className={cn(
              'min-w-12 min-h-12 w-12 h-12 rounded-full border-2 font-medium transition-all duration-200 touch-manipulation',
              value === num
                ? 'bg-brand-600 text-white border-brand-600 shadow-soft'
                : 'bg-surface-elevated text-ink-700 border-ink-200 hover:border-brand-500 hover:bg-brand-50'
            )}
          >
            {num}
          </button>
        ))}
      </div>
    </div>
  );
}