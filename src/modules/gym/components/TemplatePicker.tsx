import { GlassCard } from '@/components/ui/GlassCard'
import { deleteWorkoutTemplate, startWorkout } from '@/db/repositories/gymRepo'
import { Trash2 } from 'lucide-react'
import { useExercises, useWorkoutTemplates } from '../hooks/useGym'
import { resolveTemplateExercises } from '../templates'

/** Lets you start a workout pre-loaded with a saved template's exercises, instead of always
 * starting blank. Templates themselves are created from an active session — see
 * ActiveWorkoutSession's "Save as template". */
export function TemplatePicker() {
  const templates = useWorkoutTemplates()
  const exercises = useExercises()
  if (!templates?.length) return null

  return (
    <GlassCard className="flex flex-col gap-2">
      <span className="text-sm text-(--color-text-secondary)">Start from a template</span>
      {templates.map((template) => {
        const exerciseNames = resolveTemplateExercises(template.exerciseOrder, exercises ?? [])
          .map((exercise) => exercise.name)
          .join(', ')
        return (
          <div key={template.id} className="flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => startWorkout(template.name, template.id)}
              className="flex-1 text-left"
            >
              <span className="block text-sm font-medium">{template.name}</span>
              {exerciseNames && (
                <span className="block text-xs text-(--color-text-muted)">{exerciseNames}</span>
              )}
            </button>
            <button
              type="button"
              onClick={() => deleteWorkoutTemplate(template.id)}
              className="text-(--color-text-muted)"
              aria-label="Delete template"
            >
              <Trash2 size={14} />
            </button>
          </div>
        )
      })}
    </GlassCard>
  )
}
