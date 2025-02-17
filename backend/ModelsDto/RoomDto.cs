namespace backend.ModelsDto
{
    public class RoomDto
    {
        public int IdRoom { get; set; }
        public string Name { get; set; } = null!;
        public int TotalWorkspace { get; set; }
        public int? Square { get; set; }
    }
}
