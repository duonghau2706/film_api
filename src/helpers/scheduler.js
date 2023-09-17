import cron from 'node-cron'
import { resolve } from 'path'
import systemConfig from 'config'
const schedulerConfig = systemConfig.get('schedule')
// import runTestTask from "../handlers/runTestTask";
export const iniCron = () => {
  Object.keys(schedulerConfig).forEach((key) => {
    if (key === 'test') {
      cron.schedule(schedulerConfig[key].frequency, () => {
        // runTestTask();
      })
    }
  })
}
