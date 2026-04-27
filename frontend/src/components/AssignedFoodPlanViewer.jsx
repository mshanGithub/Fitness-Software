import { useEffect, useState } from 'react';
import {
  Apple,
  ChevronLeft,
  ChevronRight,
  Coffee,
  Salad,
  Soup,
  UtensilsCrossed,
} from 'lucide-react';
import './AssignedFoodPlanViewer.css';

const mealIconMap = {
  Breakfast: Coffee,
  Lunch: Salad,
  Dinner: UtensilsCrossed,
  Snacks: Apple,
  Beverages: Soup,
};
const mealAccentMap = {
  Breakfast: '#f5b545',
  Lunch: '#56d6c2',
  Dinner: '#5da8ff',
  Snacks: '#8ed96e',
  Beverages: '#b887ff',
};

const toTitle = (value = '') => value.charAt(0).toUpperCase() + value.slice(1);

const getTodayAbsoluteDayIndex = (weeks = []) => {
  const totalDays = weeks.reduce(
    (total, week) => total + (Array.isArray(week.days) ? week.days.length : 0),
    0
  );

  if (totalDays === 0) {
    return 0;
  }

  const jsDay = new Date().getDay();
  const mondayBasedDay = (jsDay + 6) % 7;
  return Math.min(mondayBasedDay, totalDays - 1);
};

const getWeekDayIndexByAbsolute = (weeks = [], absoluteIndex = 0) => {
  let offset = 0;

  for (let weekIndex = 0; weekIndex < weeks.length; weekIndex += 1) {
    const dayCount = Array.isArray(weeks[weekIndex]?.days) ? weeks[weekIndex].days.length : 0;

    if (absoluteIndex < offset + dayCount) {
      return {
        weekIndex,
        dayIndex: absoluteIndex - offset,
      };
    }

    offset += dayCount;
  }

  return { weekIndex: 0, dayIndex: 0 };
};

const AssignedFoodPlanViewer = ({ foodPlans = [] }) => {
  const [activePlanIndex, setActivePlanIndex] = useState(0);
  const [activeWeekIndex, setActiveWeekIndex] = useState(0);
  const [activeDayIndex, setActiveDayIndex] = useState(0);

  useEffect(() => {
    setActivePlanIndex(0);

    const firstPlanStructuredWeeks = foodPlans[0]?.structuredPlan?.weeks || [];
    if (firstPlanStructuredWeeks.length > 0) {
      const todayAbsoluteDay = getTodayAbsoluteDayIndex(firstPlanStructuredWeeks);
      const { weekIndex, dayIndex } = getWeekDayIndexByAbsolute(firstPlanStructuredWeeks, todayAbsoluteDay);
      setActiveWeekIndex(weekIndex);
      setActiveDayIndex(dayIndex);
      return;
    }

    setActiveWeekIndex(0);
    setActiveDayIndex(0);
  }, [foodPlans]);

  if (!foodPlans.length) {
    return null;
  }

  const selectedPlan = foodPlans[Math.min(activePlanIndex, Math.max(foodPlans.length - 1, 0))];
  const structuredPlan = selectedPlan?.structuredPlan;

  if (!structuredPlan || !Array.isArray(structuredPlan.weeks) || structuredPlan.weeks.length === 0) {
    return (
      <section className="food-plan-shell">
        <div className="food-plan-head">
          <h3>{selectedPlan.name}</h3>
          <p>{selectedPlan.summary || 'Food plan assigned by admin'}</p>
        </div>
        <div className="food-plan-fallback-grid">
          {(selectedPlan.sections || []).map((section, index) => (
            <article className="food-plan-fallback-card" key={`${selectedPlan._id}-section-${index}`}>
              <h4>{section.heading || `Section ${index + 1}`}</h4>
              <ul>
                {(section.items || []).map((item, itemIndex) => (
                  <li key={`${selectedPlan._id}-section-${index}-item-${itemIndex}`}>{item}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>
    );
  }

  const weeks = structuredPlan.weeks;
  const selectedWeek = weeks[Math.min(activeWeekIndex, weeks.length - 1)] || weeks[0];
  const days = Array.isArray(selectedWeek?.days) ? selectedWeek.days : [];
  const selectedDay = days[Math.min(activeDayIndex, Math.max(days.length - 1, 0))] || days[0] || null;
  const todayAbsoluteDay = getTodayAbsoluteDayIndex(weeks);
  const todayPosition = getWeekDayIndexByAbsolute(weeks, todayAbsoluteDay);

  const totalDays = weeks.reduce(
    (total, week) => total + (Array.isArray(week.days) ? week.days.length : 0),
    0
  );

  const previousWeeksDays = weeks
    .slice(0, activeWeekIndex)
    .reduce((total, week) => total + (Array.isArray(week.days) ? week.days.length : 0), 0);

  const currentDayNumber = previousWeeksDays + activeDayIndex + 1;

  const moveDay = (step) => {
    if (!selectedDay) {
      return;
    }

    if (step < 0) {
      if (activeDayIndex > 0) {
        setActiveDayIndex((prev) => prev - 1);
        return;
      }

      if (activeWeekIndex > 0) {
        const previousWeek = weeks[activeWeekIndex - 1];
        const previousWeekDaysCount = (previousWeek?.days || []).length;
        setActiveWeekIndex((prev) => prev - 1);
        setActiveDayIndex(Math.max(previousWeekDaysCount - 1, 0));
      }
      return;
    }

    if (activeDayIndex < days.length - 1) {
      setActiveDayIndex((prev) => prev + 1);
      return;
    }

    if (activeWeekIndex < weeks.length - 1) {
      setActiveWeekIndex((prev) => prev + 1);
      setActiveDayIndex(0);
    }
  };

  return (
    <section className="food-plan-shell">
      {foodPlans.length > 1 && (
        <div className="food-plan-assigned-tabs" role="tablist" aria-label="Assigned food plans">
          {foodPlans.map((plan, index) => (
            <button
              type="button"
              key={plan._id || plan.code || `food-plan-${index}`}
              className={`food-plan-assigned-tab ${index === activePlanIndex ? 'active' : ''}`}
              onClick={() => {
                setActivePlanIndex(index);
                const planWeeks = plan?.structuredPlan?.weeks || [];
                if (planWeeks.length > 0) {
                  const planTodayAbsoluteDay = getTodayAbsoluteDayIndex(planWeeks);
                  const { weekIndex, dayIndex } = getWeekDayIndexByAbsolute(planWeeks, planTodayAbsoluteDay);
                  setActiveWeekIndex(weekIndex);
                  setActiveDayIndex(dayIndex);
                } else {
                  setActiveWeekIndex(0);
                  setActiveDayIndex(0);
                }
              }}
            >
              {plan.name}
            </button>
          ))}
        </div>
      )}

      <header className="food-plan-hero">
        <span className="food-plan-brand">Train With Cain</span>
        <h3>{structuredPlan.title || selectedPlan.name}</h3>
        <p>{structuredPlan.subtitle || selectedPlan.summary}</p>
        {Array.isArray(structuredPlan.outcomes) && structuredPlan.outcomes.length > 0 && (
          <div className="food-plan-outcomes">
            {structuredPlan.outcomes.map((outcome, index) => (
              <span key={`outcome-${index}`} className="food-plan-outcome-chip">{outcome}</span>
            ))}
          </div>
        )}
      </header>

      <div className="food-plan-week-tabs" role="tablist" aria-label="Plan weeks">
        {weeks.map((week, index) => (
          <button
            type="button"
            key={week.key || week.label || `week-${index}`}
            className={`food-plan-week-tab ${index === activeWeekIndex ? 'active' : ''}`}
            onClick={() => {
              setActiveWeekIndex(index);
              setActiveDayIndex(0);
            }}
          >
            <span>{toTitle(week.label || `Week ${index + 1}`)}</span>
            <strong>{week.name || `Phase ${index + 1}`}</strong>
          </button>
        ))}
      </div>

      <section className="food-plan-focus-card">
        <div>
          <span className="food-plan-focus-label">{toTitle(selectedWeek.label || `Week ${activeWeekIndex + 1}`)} Focus</span>
          <h4>{selectedWeek.name || 'Weekly Focus'}</h4>
          <p>{selectedWeek.objective || ''}</p>
        </div>
        <ul>
          {(selectedWeek.focusPoints || []).map((point, index) => (
            <li key={`focus-point-${activeWeekIndex}-${index}`}>{point}</li>
          ))}
        </ul>
      </section>

      <div className="food-plan-day-tabs" role="tablist" aria-label="Days">
        {days.map((day, index) => (
          <button
            type="button"
            key={`${selectedWeek.key || 'week'}-day-${index}`}
            className={`food-plan-day-tab ${index === activeDayIndex ? 'active' : ''} ${activeWeekIndex === todayPosition.weekIndex && index === todayPosition.dayIndex ? 'today' : ''}`}
            onClick={() => setActiveDayIndex(index)}
          >
            {day.day || `Day ${index + 1}`}
          </button>
        ))}
      </div>

      {selectedDay && (
        <>
          <div className="food-plan-day-nav">
            <button
              type="button"
              className="food-plan-nav-button"
              onClick={() => moveDay(-1)}
              disabled={activeWeekIndex === 0 && activeDayIndex === 0}
            >
              <ChevronLeft size={16} />
              Prev
            </button>
            <div className="food-plan-day-title">
              <span>Day {currentDayNumber} of {totalDays}</span>
              <strong>{selectedDay.day} · {selectedWeek.label || `Week ${activeWeekIndex + 1}`}</strong>
              {activeWeekIndex === todayPosition.weekIndex && activeDayIndex === todayPosition.dayIndex && (
                <em className="food-plan-today-badge">Today's Menu</em>
              )}
            </div>
            <button
              type="button"
              className="food-plan-nav-button"
              onClick={() => moveDay(1)}
              disabled={activeWeekIndex === weeks.length - 1 && activeDayIndex === days.length - 1}
            >
              Next
              <ChevronRight size={16} />
            </button>
          </div>

          <div className="food-plan-meals-grid">
            {(selectedDay.meals || []).map((meal, index) => {
              const Icon = mealIconMap[meal.name] || UtensilsCrossed;
              const accent = mealAccentMap[meal.name] || '#7ecdd6';

              return (
                <article className="food-plan-meal-card" key={`meal-${activeWeekIndex}-${activeDayIndex}-${index}`}>
                  <div className="food-plan-meal-head">
                    <div className="food-plan-meal-icon" style={{ backgroundColor: `${accent}33`, color: accent }}>
                      <Icon size={16} />
                    </div>
                    <div>
                      <span>{meal.name}</span>
                      <h5>{meal.title}</h5>
                    </div>
                  </div>
                  <ul>
                    {(meal.items || []).map((item, itemIndex) => (
                      <li key={`meal-item-${activeWeekIndex}-${activeDayIndex}-${index}-${itemIndex}`}>{item}</li>
                    ))}
                  </ul>
                </article>
              );
            })}
          </div>
        </>
      )}

    </section>
  );
};

export default AssignedFoodPlanViewer;
