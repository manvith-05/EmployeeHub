package employee.service;

import employee.entity.Salary;
import employee.repository.SalaryRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SalaryService {

    private final SalaryRepository repository;

    public SalaryService(SalaryRepository repository) {
        this.repository = repository;
    }

    public Salary addSalary(Salary salary) {

        double netSalary =
                salary.getBasicSalary()
                + salary.getAllowances()
                - salary.getDeductions();

        salary.setNetSalary(netSalary);

        return repository.save(salary);
    }

    public List<Salary> getAllSalaries() {
        return repository.findAll();
    }

    public Salary getSalaryById(Long id) {
        return repository.findById(id).orElse(null);
    }

    public Salary updateSalary(Long id, Salary salary) {

        Salary existing = repository.findById(id).orElse(null);

        if (existing != null) {

            existing.setEmployeeId(salary.getEmployeeId());
            existing.setBasicSalary(salary.getBasicSalary());
            existing.setAllowances(salary.getAllowances());
            existing.setDeductions(salary.getDeductions());

            double netSalary =
                    salary.getBasicSalary()
                    + salary.getAllowances()
                    - salary.getDeductions();

            existing.setNetSalary(netSalary);

            return repository.save(existing);
        }

        return null;
    }

    public void deleteSalary(Long id) {
        repository.deleteById(id);
    }
}