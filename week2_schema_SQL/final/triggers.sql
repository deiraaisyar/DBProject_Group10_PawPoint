USE pawpoint;

DELIMITER $$

CREATE TRIGGER trg_create_treatment_record
AFTER UPDATE ON appointment
FOR EACH ROW
BEGIN
    IF NEW.status = 'completed' AND OLD.status <> 'completed' THEN
        IF NOT EXISTS (
            SELECT 1 FROM treatment_record
            WHERE appointment_id = NEW.appointment_id
        ) THEN
            INSERT INTO treatment_record (date, diagnosis, note, appointment_id)
            VALUES (
                DATE(NEW.datetime),
                'Pending diagnosis',
                'Auto generated when appointment completed',
                NEW.appointment_id
            );
        END IF;
    END IF;
END$$

DELIMITER ;
