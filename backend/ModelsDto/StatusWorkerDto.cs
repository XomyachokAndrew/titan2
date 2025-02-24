﻿namespace backend.ModelsDto
{
    public class StatusWorkerDto
    {
        public int IdStatusWorker { get; set; }
        public int IdWorker { get; set; }
        public DateOnly? StartDate { get; set; }
        public DateOnly? EndDate { get; set; }
        public int IdPost { get; set; }
        public int IdDepartment { get; set; }
        public int IdUser { get; set; }
        public int? IdStatus { get; set; }
    }
}
