import { RachasRepository } from './rachas.repository';

export class RachasService {
    private repository: RachasRepository;

    constructor() {
        this.repository = new RachasRepository();
    }

    async getRacha(userId: string) {
        return this.repository.getRacha(userId);
    }

    async updateStreak(userId: string): Promise<void> {
        const racha = await this.repository.getRacha(userId);
        const today = new Date().toISOString().split('T')[0];

        if (!racha) {
            // First time activity
            await this.repository.createRacha(userId, 1, 1, today);
            return;
        }

        const lastDate = racha.ultima_fecha;

        if (lastDate === today) {
            // Already counted for today
            return;
        }

        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        if (lastDate === yesterdayStr) {
            // Consecutive day
            const newCurrent = racha.racha_actual + 1;
            const newMax = Math.max(racha.racha_maxima, newCurrent);
            await this.repository.updateRacha(userId, newCurrent, newMax, today);
        } else {
            // Broken streak, but activity done today means streak starts at 1
            // Previous max is preserved
            // "si pierde la racha, se reincia en cero la racha actual" -> but they just did an activity, so it becomes 1?
            // The user said: "la idea es que el usaurio debe al menos hacer una mision diaria... para activar la racha"
            // So if they missed a day, their streak *was* 0 (conceptually), but now they did something, so it's 1.

            // Wait, if they check their streak BEFORE doing an activity, it should show 0 if they missed yesterday.
            // But this function `updateStreak` is called WHEN they do an activity.
            // So setting it to 1 is correct.
            await this.repository.updateRacha(userId, 1, racha.racha_maxima, today);
        }
    }
}
