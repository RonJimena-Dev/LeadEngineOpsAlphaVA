'use client';

interface ProgressTrackerProps {
  currentStep: 'filters' | 'searching' | 'results';
  totalLeads?: number;
  isLoading?: boolean;
  hasFilters?: boolean;
}

export default function ProgressTracker({ 
  currentStep, 
  totalLeads = 0, 
  isLoading = false,
  hasFilters = false 
}: ProgressTrackerProps) {
  const steps = [
    {
      key: 'filters',
      label: 'Filters Accepted',
      icon: '✅',
      description: 'Select your target criteria',
      isActive: currentStep === 'filters',
      isCompleted: hasFilters || currentStep === 'searching' || currentStep === 'results'
    },
    {
      key: 'searching',
      label: 'Searching...',
      icon: '🔍',
      description: 'AI is finding leads',
      isActive: currentStep === 'searching',
      isCompleted: currentStep === 'results'
    },
    {
      key: 'results',
      label: `Found ${totalLeads} leads`,
      icon: '🎯',
      description: 'Leads ready for review',
      isActive: currentStep === 'results',
      isCompleted: currentStep === 'results'
    }
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 text-center">
        🚀 Lead Generation Progress
      </h3>
      
      <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4 lg:space-x-8">
        {steps.map((step, index) => (
          <div key={step.key} className="flex flex-col items-center space-y-3">
            {/* Step Icon and Status */}
            <div className="relative">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl transition-all duration-500 ${
                step.isCompleted 
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' 
                  : step.isActive 
                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 animate-pulse' 
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500'
              }`}>
                {step.icon}
              </div>
              
              {/* Active indicator */}
              {step.isActive && (
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full animate-ping"></div>
              )}
              
              {/* Checkmark for completed steps */}
              {step.isCompleted && step.key !== 'results' && (
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">✓</span>
                </div>
              )}
            </div>

            {/* Step Label */}
            <div className="text-center">
              <h4 className={`font-semibold text-sm transition-colors duration-300 ${
                step.isActive 
                  ? 'text-blue-600 dark:text-blue-400' 
                  : step.isCompleted 
                    ? 'text-green-600 dark:text-green-400' 
                    : 'text-gray-500 dark:text-gray-400'
              }`}>
                {step.label}
              </h4>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {step.description}
              </p>
            </div>

            {/* Arrow connector (except for last step) */}
            {index < steps.length - 1 && (
              <div className="hidden sm:block">
                <div className={`w-8 lg:w-16 h-0.5 transition-all duration-500 ${
                  step.isCompleted ? 'bg-green-300 dark:bg-green-700' : 'bg-gray-300 dark:bg-gray-600'
                }`}></div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Progress Bar */}
      <div className="mt-8">
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-1000 ease-out ${
              currentStep === 'filters' ? 'w-0' :
              currentStep === 'searching' ? 'w-1/2' :
              currentStep === 'results' ? 'w-full' : 'w-0'
            } ${
              currentStep === 'searching' ? 'bg-blue-500' : 'bg-green-500'
            }`}
          ></div>
        </div>
        
        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-2">
          <span>0%</span>
          <span>{currentStep === 'filters' ? '0%' : currentStep === 'searching' ? '50%' : '100%'}</span>
        </div>
      </div>

      {/* Status Message */}
      <div className="mt-6 text-center">
        <p className={`text-sm font-medium transition-colors duration-300 ${
          currentStep === 'filters' 
            ? 'text-gray-600 dark:text-gray-300' 
            : currentStep === 'searching' 
              ? 'text-blue-600 dark:text-blue-400' 
              : 'text-green-600 dark:text-green-400'
        }`}>
          {currentStep === 'filters' && 'Ready to start lead generation'}
          {currentStep === 'searching' && 'AI is actively searching for leads...'}
          {currentStep === 'results' && `Successfully found ${totalLeads} high-quality leads!`}
        </p>
      </div>
    </div>
  );
}
