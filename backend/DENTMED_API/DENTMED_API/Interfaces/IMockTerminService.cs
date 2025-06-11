// DENTMED_API/Interfaces/IMockTerminService.cs
using DENTMED_API.Models;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace DENTMED_API.Interfaces
{
    public interface IMockTerminService
    {
        Task<List<Termin>> GetMockTerminBySmjenaIdAsync(int smjenaId, DateOnly datum, int trajanje);
    }
}