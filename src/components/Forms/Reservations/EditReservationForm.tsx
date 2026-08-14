import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { DatePicker } from "@/components/ui/date-picker";
import { TimePicker } from "@/components/ui/time-picker";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useUpdateReservation } from "@/hooks/useReservationV2";
import type { ReservationV2 } from "@/api/reservationV2";

const FieldError = ({ message }: { message?: string }) =>
  message ? <p className="text-xs text-destructive mt-0.5">{message}</p> : null;

interface EditForm {
  party_size: number;
  duration_minutes: number;
  date: string; // yyyy-MM-dd
  time: string; // HH:mm
  isActive: boolean;
}

// Staff-only edit: party_size, reserved_for, duration_minutes, isActive.
function EditReservationDialog({
  reservation,
  onClose,
}: {
  reservation: ReservationV2 | null;
  onClose: () => void;
}) {
  const { mutateAsync, isPending } = useUpdateReservation();
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<EditForm>({
    defaultValues: {
      party_size: reservation?.party_size ?? 2,
      duration_minutes: reservation?.duration_minutes ?? 90,
      date: reservation?.reserved_for.slice(0, 10) ?? "",
      time: reservation?.reserved_for.slice(11, 16) ?? "",
      isActive: true,
    },
  });

  register("date", { required: "Required" });
  register("time", { required: "Required" });

  if (!reservation) return null;

  const onSubmit = async (data: EditForm) => {
    await mutateAsync({
      id: reservation.id,
      payload: {
        party_size: Number(data.party_size),
        duration_minutes: Number(data.duration_minutes),
        reserved_for:
          data.date && data.time
            ? `${data.date}T${data.time}:00`
            : undefined,
        isActive: data.isActive,
      },
    });
    onClose();
  };

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit reservation</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Party size</Label>
              <Input
                type="number"
                min={1}
                {...register("party_size", {
                  required: "Required",
                  min: { value: 1, message: "Min 1" },
                  valueAsNumber: true,
                })}
              />
              <FieldError message={errors.party_size?.message} />
            </div>
            <div className="space-y-1.5">
              <Label>Duration (min)</Label>
              <Input
                type="number"
                min={15}
                step={15}
                {...register("duration_minutes", {
                  required: "Required",
                  min: { value: 15, message: "Min 15" },
                  valueAsNumber: true,
                })}
              />
              <FieldError message={errors.duration_minutes?.message} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Date</Label>
              <DatePicker
                value={watch("date")}
                onChange={(v) =>
                  setValue("date", v, { shouldValidate: true })
                }
              />
              <FieldError message={errors.date?.message} />
            </div>
            <div className="space-y-1.5">
              <Label>Time</Label>
              <TimePicker
                value={watch("time")}
                onChange={(v) =>
                  setValue("time", v, { shouldValidate: true })
                }
              />
              <FieldError message={errors.time?.message} />
            </div>
          </div>
          <div className="flex items-center justify-between pt-1">
            <Label>Active</Label>
            <Switch
              checked={watch("isActive")}
              onCheckedChange={(v) => setValue("isActive", v)}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving…" : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default EditReservationDialog;
