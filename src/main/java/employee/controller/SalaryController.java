package employee.controller;

import employee.entity.Salary;
import employee.service.SalaryService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/salaries")
public class SalaryController {

    private final SalaryService service;

    public SalaryController(SalaryService service) {
        this.service = service;
    }

    @PostMapping
    public Salary addSalary(@RequestBody Salary salary) {
        return service.addSalary(salary);
    }

    @GetMapping
    public List<Salary> getAllSalaries() {
        return service.getAllSalaries();
    }

    @GetMapping("/{id}")
    public Salary getSalary(@PathVariable Long id) {
        return service.getSalaryById(id);
    }

    @PutMapping("/{id}")
    public Salary updateSalary(
            @PathVariable Long id,
            @RequestBody Salary salary) {
        return service.updateSalary(id, salary);
    }

    @DeleteMapping("/{id}")
    public String deleteSalary(@PathVariable Long id) {
        service.deleteSalary(id);
        return "Salary deleted successfully";
    }
}