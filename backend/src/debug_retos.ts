import dotenv from 'dotenv';
import path from 'path';

// Load .env from backend root
dotenv.config({ path: path.resolve(__dirname, '../.env') });

import { RetosRepository } from './modules/retos/retos.repository';

(async () => {
    try {
        console.log("Debugging Retos...");
        const repo = new RetosRepository();

        console.log("1. Finding Active Challenges...");
        const challenges = await repo.findActiveChallenges();
        console.log("Active Challenges Found:", challenges.length);
        console.log(JSON.stringify(challenges, null, 2));

        if (challenges.length > 0) {
            const retoId = challenges[0].id;
            console.log(`2. Getting Tasks for Reto ${retoId}...`);
            const tasks = await repo.getTasksByChallengeId(retoId);
            console.log("Tasks found:", tasks.length);
            console.log(JSON.stringify(tasks, null, 2));
        } else {
            console.log("No active challenges to test tasks with.");
        }

    } catch (e) {
        console.error("DEBUG ERROR:", e);
    }
})();
