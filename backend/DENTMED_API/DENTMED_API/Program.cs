// Program.cs

using DENTMED_API.Contexts;
using DENTMED_API.Services;
using Microsoft.EntityFrameworkCore;
using System.Net.Http.Headers;
using DENTMED_API.Interfaces;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddScoped<PacijentService>();
builder.Services.AddScoped<TerminServices>();
builder.Services.AddScoped<DokumentacijaService>();
builder.Services.AddScoped<RadnoVrijemeService>();

builder.Services.AddHttpClient("CamundaClient", client =>
{
    client.BaseAddress = new Uri(builder.Configuration["Camunda:RestApiBaseUrl"] ?? "http://localhost:8080/engine-rest");
    client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
});
builder.Services.AddLogging();

// OVO TREBATE DODATI! Registrirajte CamundaWorkerService za DI
builder.Services.AddSingleton<CamundaWorkerService>(); // ILI AddScoped, ovisno o životnom vijeku koji želite

// OVO JE VEĆ POSTOJEĆE, SAMO GA OSTAVITE KAKO JESTE:
builder.Services.AddHostedService<CamundaWorkerService>();

builder.Services.AddSingleton<IMockTerminService, MockTerminService>();

//CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp", policy =>
    {
        policy.WithOrigins("http://localhost:5173")
              .AllowAnyHeader()
              .AllowAnyMethod();
        policy.WithOrigins("http://localhost:4173")
              .AllowAnyHeader()
              .AllowAnyMethod();
        policy.WithOrigins("http://localhost:8080")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});


var app = builder.Build();

app.UseCors("AllowReactApp");

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseRouting();

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();