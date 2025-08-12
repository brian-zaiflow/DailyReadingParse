import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { AlertCircle, RotateCcw, Check } from "lucide-react";
import { getTodayReadings, updateReadingProgress, DailyReadingsData } from "@/lib/readingsService";


export default function ReadingsPage() {
  const [dailyReadings, setDailyReadings] = useState<DailyReadingsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReadings = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const readings = await getTodayReadings();
      setDailyReadings(readings);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch readings');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReadings();
  }, []);

  const handleCheckboxChange = (readingId: string, completed: boolean) => {
    // Update localStorage
    updateReadingProgress(readingId, completed);
    
    // Update local state
    if (dailyReadings) {
      setDailyReadings({
        ...dailyReadings,
        readings: dailyReadings.readings.map(reading =>
          reading.id === readingId ? { ...reading, completed } : reading
        )
      });
    }
  };

  const formatDate = () => {
    const date = new Date();
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const getReadingTypeColor = (type?: string) => {
    switch (type?.toLowerCase()) {
      case 'gospel':
        return 'bg-blue-100 text-blue-800';
      case 'epistle':
        return 'bg-green-100 text-green-800';
      case 'vespers':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const completedCount = dailyReadings?.readings.filter(r => r.completed).length || 0;
  const totalCount = dailyReadings?.readings.length || 0;
  const progressPercentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
              <p className="text-muted-foreground">Loading today's readings...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center border-l-4 border-destructive pl-4">
              <AlertCircle className="h-8 w-8 text-destructive mx-auto mb-3" />
              <h3 className="text-lg font-medium text-foreground mb-2">Unable to Load Readings</h3>
              <p className="text-muted-foreground text-sm mb-4">
                Please check your internet connection and try again.
              </p>
              <Button 
                onClick={fetchReadings} 
                className="bg-primary text-primary-foreground hover:bg-primary/90"
                data-testid="button-retry"
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        {/* Header Section */}
        <header className="mb-8">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-semibold text-foreground mb-2">
              Daily Scripture Readings
            </h1>
            <div className="text-muted-foreground">
              <p className="text-lg font-medium" data-testid="text-current-date">
                {formatDate()}
              </p>
              {dailyReadings?.feastDay && (
                <p className="text-sm" data-testid="text-feast-day">
                  {dailyReadings.feastDay}
                </p>
              )}
            </div>
          </div>
        </header>

        {/* Readings Checklist */}
        <div className="space-y-4 mb-8">
          {dailyReadings?.readings.map((reading) => (
            <Card 
              key={reading.id} 
              className="hover:shadow-md transition-shadow"
              data-testid={`card-reading-${reading.id}`}
            >
              <CardContent className="p-0">
                <label className="flex items-start p-4 cursor-pointer">
                  <Checkbox
                    checked={reading.completed}
                    onCheckedChange={(checked) => 
                      handleCheckboxChange(reading.id, !!checked)
                    }
                    className="mt-1 mr-4 w-5 h-5"
                    data-testid={`checkbox-reading-${reading.id}`}
                  />
                  <div className="flex-grow">
                    <div className="flex justify-between items-start mb-1">
                      <h3 
                        className={`text-base font-medium text-foreground ${
                          reading.completed ? 'line-through' : ''
                        }`}
                        data-testid={`text-reading-title-${reading.id}`}
                      >
                        {reading.title}
                      </h3>
                      {reading.readingType && (
                        <span 
                          className={`text-xs px-2 py-1 rounded ${getReadingTypeColor(reading.readingType)}`}
                          data-testid={`badge-reading-type-${reading.id}`}
                        >
                          {reading.readingType}
                        </span>
                      )}
                    </div>
                    <p 
                      className={`text-sm ${
                        reading.completed 
                          ? 'text-green-600' 
                          : 'text-muted-foreground'
                      }`}
                      data-testid={`text-reading-status-${reading.id}`}
                    >
                      {reading.completed ? (
                        <>
                          <Check className="inline w-4 h-4 mr-1" />
                          Completed
                        </>
                      ) : (
                        'Tap to mark as completed'
                      )}
                    </p>
                  </div>
                </label>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Progress Summary */}
        {dailyReadings && dailyReadings.readings.length > 0 && (
          <Card className="mb-8">
            <CardContent className="p-4">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-medium text-foreground">Reading Progress</h3>
                <span 
                  className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm"
                  data-testid="badge-progress"
                >
                  {completedCount}/{totalCount} completed
                </span>
              </div>
              <Progress 
                value={progressPercentage} 
                className="w-full mb-2"
                data-testid="progress-bar"
              />
              <p className="text-xs text-muted-foreground">
                Keep up the great work! {totalCount - completedCount} reading{totalCount - completedCount !== 1 ? 's' : ''} remaining.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Footer */}
        <footer className="text-center text-xs text-muted-foreground">
          <p>
            Readings from{' '}
            <a 
              href="https://www.oca.org" 
              className="text-primary hover:underline"
              target="_blank"
              rel="noopener noreferrer"
              data-testid="link-oca"
            >
              Orthodox Church in America
            </a>
          </p>
          <p className="mt-1">Progress saved automatically</p>
        </footer>
      </div>
    </div>
  );
}
