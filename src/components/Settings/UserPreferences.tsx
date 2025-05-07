import React from 'react';
import { motion } from 'framer-motion';
import { useSettings } from '../../context/SettingsContext';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../ui/Card';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Switch } from '../ui/Switch';
import { Button } from '../ui/Button';
import { RotateCcw } from 'lucide-react';

export const UserPreferences: React.FC = () => {
  const { settings, updateSettings, resetSettings } = useSettings();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>User Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-4">
            <Input
              label="Time per question (seconds)"
              type="number"
              min={5}
              max={300}
              value={settings.timePerQuestion}
              onChange={(e) => 
                updateSettings({ timePerQuestion: parseInt(e.target.value) })
              }
              helper="How much time is allowed for each question"
            />
            
            <Switch
              label="Restart quiz on wrong answer"
              checked={settings.restartOnError}
              onChange={(checked) => 
                updateSettings({ restartOnError: checked })
              }
            />
            
            <Select
              label="Show explanations"
              options={[
                { value: 'after', label: 'After each question' },
                { value: 'end', label: 'At the end of the quiz' },
                { value: 'never', label: 'Never' },
              ]}
              value={settings.showExplanations}
              onChange={(value) => 
                updateSettings({ showExplanations: value as 'after' | 'end' | 'never' })
              }
              helper="When to show explanations for correct answers"
            />
          </div>
          
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
              Accessibility Settings
            </h3>
            
            <div className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              <p>Keyboard shortcuts:</p>
              <ul className="list-disc pl-5 mt-1 space-y-1">
                <li>Alt+C: Go to Create page</li>
                <li>Alt+I: Go to Import page</li>
                <li>Alt+Q: Go to Quiz page</li>
                <li>Alt+S: Go to Settings page</li>
              </ul>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button 
            variant="outline"
            onClick={resetSettings}
            className="flex items-center"
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Reset to Defaults
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
};